import { ConflictException, HttpCode, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TrackingDevicesRegisterDto } from './dto/tracking-devices.register.dto';
import { PaginationDto } from './dto/tracking-devices.pagination.dto';

@Injectable()
export class TrackingDevicesService {
    constructor(
        private readonly prisma : PrismaService
    ){}

    async register(dto: TrackingDevicesRegisterDto, loggedUserId : string)
    {
        try{
            const imeiExists = await this.prisma.trackingDevices.findUnique({
                where: {
                    imei: dto.imei
                },
                select: {id:true}
            });

            if(imeiExists)
            {
                throw new ConflictException(`The IMEI '${dto.imei}' is already linked to a tracking device.`);
            }


            const userExists = await this.prisma.user.findUnique({
                where:{
                    id: loggedUserId
                },
                select: {id:true}
            });

            if(!userExists)
            {
                throw new NotFoundException(`User ID '${loggedUserId}' was not found.`);
            }

            const createTrackingDevice =  await this.prisma.trackingDevices.create({
                data: {
                    imei: dto.imei,
                    phone: dto.phone,
                    blockade: null,
                    model: dto.model,
                    protocol: dto.protocol,
                    userId: loggedUserId,
                    instaledAt: null
                },
                select: {
                    id: true
                }
            });


            return {
                message: "Tracking device registered successfully.",
                id: createTrackingDevice.id,
                error: false,
                statusCode: 201
            };
        }
        catch(error)
        {
            if(error instanceof HttpException){
                throw error;
            }
            console.error(`An internal server error occurred while registering the tracking device. error: ${error}`);
            throw new InternalServerErrorException(`An internal server error occurred while registering the tracking device.`);
        }
    }

    async getAllByUserID(paginationDto : PaginationDto, loggedUserId : string)
    {
        try
        {
            const {page = 1, limit = 10 } = paginationDto;
            const skip = (page - 1) * limit;


            const userExists = await this.prisma.user.findUnique({
                where:{
                    id: loggedUserId
                },
                select: {id:true}
            });

            if(!userExists)
            {
                throw new NotFoundException(`User ID '${loggedUserId}' was not found.`);
            }


            const totalDevices = await this.prisma.trackingDevices.count({
                where: {
                    userId: loggedUserId, 
                    deletedAt: null
                }
            });

            if(totalDevices === 0)
            {
                return {
                    data: [],
                    meta: {
                        totalItems: totalDevices,
                        page,
                        limit,
                        totalPages: 0
                    }
                }
            }

            const getall = await this.prisma.trackingDevices.findMany({
                where: {
                    userId: loggedUserId,
                    deletedAt: null
                }
            });

            const dataBuilder = getall.map((device : any) => {
                return {
                    id: device.id,
                    imei: device.imei,
                    phone: device.phone,
                    blockade: device.blockade,
                    protocol: device.protocol,
                    model: device.model,
                    instaledAt: device.instaledAt,
                    createdAt: device.createdAt,
                    updatedAt: device.updatedAt,
                };
            }); 



             const totalPages = Math.ceil(totalDevices / limit);

             return{
                data: dataBuilder,
                meta: {
                    totalItems: totalDevices,
                    page,
                    limit,
                    totalPages
                }
             }
        }
        catch(error)
        {   
            if(error instanceof HttpException){
                throw error;
            }
            console.error(`An error occurred while fetching the tracking devices list. error: ${error}`);
            throw new InternalServerErrorException(`An error occurred while fetching the tracking devices list.`);

        }   
    }

    async deletedById(trackingDevicesId : string , loggedUserId : string)
    {
        try
        {
            const userExists = await this.prisma.user.findUnique({
                where:{
                    id: loggedUserId
                },
                select: {id:true}
            });

            if(!userExists)
            {
                throw new NotFoundException(`User ID '${loggedUserId}' was not found.`);
            }


            const trackingDeviceExists = await this.prisma.trackingDevices.findUnique({
                where: {
                    id: trackingDevicesId
                },
                select: {id:true}
            });

            if(!trackingDeviceExists)
            {   
                throw new NotFoundException(`Tracking Device ID '${trackingDevicesId}' was not found.`);
            }


            const deletedAt = await this.prisma.trackingDevices.update({
                where:{
                    userId: loggedUserId,
                    id: trackingDevicesId
                },
                data:{
                    deletedAt: new Date()
                }
            })

        }
        catch(error)
        {   
            if(error instanceof HttpException){
                throw error;
            }
            console.error(`An error occurred while trying to delete the tracking device: ${error}`);
            throw new InternalServerErrorException('An error occurred while trying to delete the tracking device.');
        }
    }

    async getOneByID(trackingDevicesId : string , loggedUserId : string)
    {
        try
        {
            const userExists = await this.prisma.user.findUnique({
                where:{
                    id: loggedUserId
                },
                select: {id:true}
            });

            if(!userExists)
            {
                throw new NotFoundException(`User ID '${loggedUserId}' was not found.`);
            }


            const trackingDeviceExists = await this.prisma.trackingDevices.findUnique({
                where: {
                    id: trackingDevicesId
                },
            });

            if(!trackingDeviceExists)
            {   
                throw new NotFoundException(`Tracking Device ID '${trackingDevicesId}' was not found.`);
            }

            return {
                data: {
                    id: trackingDeviceExists.id,
                    imei: trackingDeviceExists.imei,
                    phone: trackingDeviceExists.phone,
                    blockade: trackingDeviceExists.blockade,
                    protocol: trackingDeviceExists.protocol,
                    model: trackingDeviceExists.model,
                    instaledAt: trackingDeviceExists.instaledAt,
                    createdAt: trackingDeviceExists.createdAt,
                    updatedAt: trackingDeviceExists.updatedAt
                },
                error: false,
                statusCode: 201
            };
        }
        catch(error)
        {
            if(error instanceof HttpException){
                throw error;
            }
            console.error(`error: ${error}`);
            throw new InternalServerErrorException(``);
        }
    }
}
