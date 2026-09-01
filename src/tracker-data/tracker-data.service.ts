import { HttpException, Injectable, Inject, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTrackerDataDto } from './dto/create-tracker-data.dto';
import { PaginationDto } from 'src/tracking-devices/dto/tracking-devices.pagination.dto';
import { REDIS_CLIENT } from 'src/redis/redis.module';
import Redis from 'ioredis';

@Injectable()
export class TrackerDataService {
    private readonly logger = new Logger(TrackerDataService.name)
    constructor(
        private readonly prisma: PrismaService,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
    ){}

    async create(dto: CreateTrackerDataDto) {
        try {
        const latTruncated = Number(dto.lat.toFixed(4));
        const lngTruncated = Number(dto.lng.toFixed(4));
        const redisKey = `tracker:last:${dto.imei}`;

        const lastPos = await this.redis.hgetall(redisKey);
        const utc_3 = new Date(Date.now() - 3 * 3600 * 1000);

        if (lastPos && lastPos.id) {
            const lastLat = Number(lastPos.lat);
            const lastLng = Number(lastPos.lng);

            if (lastLat === latTruncated && lastLng === lngTruncated) {
                
                await this.prisma.trackerData.update({
                    where: { id: lastPos.id },
                    data: {
                        createdAt: utc_3,
                        gpsAt: dto.gpsAt,
                        speed: 0
                    },
                });
                return;
            }
        }

        const newRecord = await this.prisma.trackerData.create({
            data: {
                imei: dto.imei,
                lat: dto.lat,
                lng: dto.lng,
                speed: dto.speed,
                course: dto.course,
                satCount: dto.satCount,
                gpsAt: dto.gpsAt,
                createdAt: utc_3
            },
        });

        await this.redis.hmset(redisKey, {
            id: newRecord.id,
            lat: latTruncated,
            lng: lngTruncated,
        });
        } catch (error) {
        this.logger.error(`Erro ao processar pacote do IMEI: "${dto.imei}"`, error);
        }
   }


    async getAllByUserId(paginationDto : PaginationDto, id : string, vehicle : boolean, loggedUserId : string, date? : string)
    {
        try{
            const { page = 1, limit = 10 } = paginationDto;
            const skip = (page - 1) * limit;

            const userExists = await this.prisma.user.findUnique({
                where:{
                    id: loggedUserId,
                    deletedAt: null
                },
                select: {id:true}
            });

            if(!userExists)
            {
                throw new NotFoundException(`User ID '${loggedUserId}' was not found.`);
            }
            
            let imei;
            if(vehicle)
            {
                const vehicleExists = await this.prisma.vehicles.findUnique({
                    where: {
                        id,
                        deletedAt: null
                    }
                });

                if(!vehicleExists || !vehicleExists.trackingDeviceId)
                {
                    throw new NotFoundException(`Vehicle ID '${id}' was not found.`);
                }


                const trackingDeviceExists = await this.prisma.trackingDevices.findUnique({
                    where: {
                        id: vehicleExists.trackingDeviceId,
                        deletedAt: null
                    }
                });

                if(!trackingDeviceExists || !trackingDeviceExists.imei)
                {
                    throw new NotFoundException(`Tracking device not found for vehicle Id '${id}'.`);
                }

                imei = trackingDeviceExists.imei;               
            }
            else
            {
                const trackingDeviceExists = await this.prisma.trackingDevices.findUnique({
                    where: {
                        id: id,
                        deletedAt: null
                    }
                });

                if(!trackingDeviceExists || !trackingDeviceExists.imei)
                {
                    throw new NotFoundException(`Tracking device '${id}' was not found.`);
                }

                imei = trackingDeviceExists.imei;     
            }
             
            const createdAtFilter = this.getDateRange(date);
            const whereSintax : any = { imei };

            if(createdAtFilter)
            {
                whereSintax.createdAt = createdAtFilter;
            }

            const totalTrackerData = await this.prisma.trackerData.count({
                where: whereSintax
            });

            if(totalTrackerData === 0)
            {
                return {
                    data: [],
                    meta: {
                        totalItems: totalTrackerData,
                        page,
                        limit,
                        totalPages: 0
                    }
                }
            }

            const getall = await this.prisma.trackerData.findMany({
                where: whereSintax,
                skip: skip,
                take: limit,
                select:{
                    id: true,
                    imei: true,
                    lat: true,
                    lng: true,
                    speed: true,
                    course: true,
                    satCount: true,
                    createdAt: true
                },
                orderBy: {
                    createdAt: "desc"
                }
            });

            const dataBuilder = getall.map((trackerData : any) => {
                return {
                    id: trackerData.id,
                    imei: trackerData.imei,
                    lat: trackerData.lat,
                    lng: trackerData.lng,
                    speed: trackerData.speed,
                    course: trackerData.course,
                    sat: trackerData.satCount,
                    date: trackerData.createdAt
                }
            });

            const totalPages = Math.ceil(totalTrackerData / limit);
            
            return {
                data: dataBuilder,
                meta: {
                    totalItems: totalTrackerData,
                    page,
                    limit,
                    totalPages
                }
            }
        }
        catch(error){
            if(error instanceof HttpException){
                throw error;
            }
            console.error(`An error occurred while fetching the tracker data list. Error: ${error}`);
            throw new InternalServerErrorException(`An error occurred while fetching the tracker data list.`);
        }
    }

    async getlatest(id : string, vehicle : boolean, loggedUserId : string)
    {
        try{
            const userExists = await this.prisma.user.findUnique({
                where:{
                    id: loggedUserId,
                    deletedAt: null
                },
                select: {id:true}
            });

            if(!userExists)
            {
                throw new NotFoundException(`User ID '${loggedUserId}' was not found.`);
            }

            let imei;
            if(vehicle)
            {
                const vehicleExists = await this.prisma.vehicles.findUnique({
                    where: {
                        id,
                        deletedAt: null
                    }
                });

                if(!vehicleExists || !vehicleExists.trackingDeviceId)
                {
                    throw new NotFoundException(`Vehicle ID '${id}' was not found.`);
                }


                const trackingDeviceExists = await this.prisma.trackingDevices.findUnique({
                    where: {
                        id: vehicleExists.trackingDeviceId,
                        deletedAt: null
                    }
                });

                if(!trackingDeviceExists || !trackingDeviceExists.imei)
                {
                    throw new NotFoundException(`Tracking device not found for vehicle Id '${id}'.`);
                }

                imei = trackingDeviceExists.imei;               
            }
            else
            {
                const trackingDeviceExists = await this.prisma.trackingDevices.findUnique({
                    where: {
                        id: id,
                        deletedAt: null
                    }
                });

                if(!trackingDeviceExists || !trackingDeviceExists.imei)
                {
                    throw new NotFoundException(`Tracking device '${id}' was not found.`);
                }

                imei = trackingDeviceExists.imei;     
            }


            const getlatest = await this.prisma.trackerData.findFirst({
                where: {
                    imei: imei
                },
                orderBy: {
                    createdAt: "desc"
                },
                select: {
                    id: true,
                    imei: true,
                    lat: true,
                    lng: true,
                    speed: true,
                    course: true,
                    satCount: true,
                    createdAt: true
                }
            });

            if(!getlatest || !getlatest?.lat || !getlatest.lng)
            {
                throw new NotFoundException(`Tracker data for IMEI ${imei} was not found.`);
            }

            return {
                data: {
                    id: getlatest.id,
                    imei: getlatest.imei,
                    lat: getlatest.lat,
                    lng: getlatest.lng,
                    speed: getlatest.speed,
                    course: getlatest.course,
                    sat: getlatest.satCount,
                    date: getlatest.createdAt
                },
                error: false,
                statusCode: 200
            };
        }
        catch(error)
        {
            if(error instanceof HttpException)
            {
                throw error;
            }
            console.error(`An error occurred while fetching the one latest tracker data. Error: ${error}`);
            throw new InternalServerErrorException(`An error occurred while fetching the one latest tracker data.`);
        }
    }

    private getDateRange(dateStr?: string) 
    {
        if (!dateStr) return undefined;

        const startDate = new Date(`${dateStr}T00:00:00.000Z`);
        const endDate = new Date(`${dateStr}T23:59:59.999Z`);

        return {
            gte: startDate,
            lte: endDate,
        };
    }
}
