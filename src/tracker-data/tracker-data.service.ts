import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTrackerDataDto } from './dto/create-tracker-data.dto';
import { PaginationDto } from 'src/tracking-devices/dto/tracking-devices.pagination.dto';

@Injectable()
export class TrackerDataService {

    private readonly logger = new Logger(TrackerDataService.name)
    constructor(
        private readonly prisma: PrismaService
    ){}


    async create(dto : CreateTrackerDataDto)
    {
        try
        {
            const latTruncated = Number(dto.lat.toFixed(4));
            const lngTruncated = Number(dto.lng.toFixed(4));

            const insertedCount = await this.prisma.$executeRaw`
                INSERT INTO "TrackerData" ("id", "imei", "lat", "lng", "speed", "course", "satCount", "gpsAt", "createdAt")
                SELECT 
                gen_random_uuid(), 
                ${dto.imei}, 
                ${dto.lat}, 
                ${dto.lng}, 
                ${dto.speed}, 
                ${dto.course}, 
                ${dto.satCount}, 
                ${dto.gpsAt}, 
                NOW()
                WHERE NOT EXISTS (
                SELECT 1 FROM "TrackerData"
                WHERE "imei" = ${dto.imei}
                ORDER BY "gpsAt" DESC
                LIMIT 1
                HAVING ROUND("lat"::numeric, 4) = ${latTruncated} 
                    AND ROUND("lng"::numeric, 4) = ${lngTruncated}
                );
            `;

            if (insertedCount === 0) {
                this.logger.debug(`[IGNORADO] Posição duplicada/parada para o IMEI ${dto.imei} (${dto.lat}, ${dto.lng})`);
            }

            return insertedCount;
        }
        catch(error)
        {
            this.logger.error(`Erro ao salver pacote TCP do IMEI: "${dto.imei}"`, error);
        }
    }


    async getAllByUserId(paginationDto : PaginationDto, id : string, vehicle : boolean, loggedUserId : string)
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

            }

            const totalTrackerData = await this.prisma.trackerData.count({
                where: {
                    imei
                }
            });

            if(totalTrackerData)
            {

            }
        }
        catch(error){

        }
    }


}
