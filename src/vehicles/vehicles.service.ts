import { PrismaService } from 'src/prisma/prisma.service';
import { ConflictException, HttpException, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PaginationDto } from 'src/tracking-devices/dto/tracking-devices.pagination.dto';
import { VehiclesRegisterDto } from './dto/vehicles.register.dto';


@Injectable()
export class VehiclesService {
    constructor(
        private readonly prisma : PrismaService
    ){}

    async register(dto : VehiclesRegisterDto, loggedUserId : string)
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

            const plateExists = await this.prisma.vehicles.findUnique({
                where:{
                    plate: dto.plate
                },
                select:{
                    id: true
                }
            });

            if(plateExists)
            {
                throw new ConflictException(`The Plate '${dto.plate}' is already linked to a vehicle.`);
            }


            const trackingDeviceExists = await this.prisma.trackingDevices.findUnique({
                where: {
                    id: dto.trackingDeviceId
                },
                select: {
                    id: true
                }
            });


            if(!trackingDeviceExists)
            {
                throw new NotFoundException(`Tracking Device ID '${dto.trackingDeviceId}' was not found.`);
            }


            const createVehicle = await this.prisma.vehicles.create({
                data: {
                    make: dto.make,
                    model: dto.model,
                    year: dto.year,
                    vehicleImg: dto.vehicleImg ? dto.vehicleImg : null,
                    plate: dto.plate,
                    color: dto.color,
                    userId: loggedUserId,
                    trackingDeviceId: dto.trackingDeviceId,
                }
            });

            return {
                message: "Vehicle registered successfully.",
                id: createVehicle.id,
                error: false,
                statusCode: 201
            };
        }
        catch(error)
        {
            if(error instanceof HttpException){
                throw error;
            }
            console.error(`An internal server error occurred while registering the vehicle. Error: ${error}`);
            throw new InternalServerErrorException(`An internal server error occurred while registering the vehicle.`);
        }
    }

    async getAllByUserId(paginationDto : PaginationDto,loggedUserId : string)
    {
        try
        {
            const {page = 1, limit = 10} = paginationDto;
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


            const totalVehicles = await this.prisma.vehicles.count({
                where: {
                    userId: loggedUserId,
                    deletedAt: null
                }
            });

            if(totalVehicles === 0)
            {
                return {
                    data: [],
                    meta: {
                        totalItems: totalVehicles,
                        page,
                        limit,
                        totalPages: 0
                    }
                }
            }

            const getall = await this.prisma.vehicles.findMany({
                where: {
                    userId: loggedUserId,
                    deletedAt: null
                }
            });

            const dataBuilder = getall.map((vehicle : any) => {
                return {
                    id: vehicle.id,
                    make: vehicle.make,
                    model: vehicle.model,
                    year: vehicle.year,
                    color: vehicle.color,
                    vehicleImg: vehicle.vehicleImg,
                    plate: vehicle.plate,
                    userId: vehicle.userId,
                    trackingDeviceId: vehicle.trackingDeviceId,
                    createdAt: vehicle.createdAt,
                    updatedAt: vehicle.updatedAt,
                }
            });

            const totalPages = Math.ceil(totalVehicles / limit);

            return {
                data: dataBuilder,
                meta: {
                    totalItems: totalVehicles,
                    page,
                    limit,
                    totalPages
                }
            };
        }
        catch(error)
        {
            if(error instanceof HttpException){
                throw error;
            }
            console.error(`An error occurred while fetching the vehicles list.`);
            throw new InternalServerErrorException(`An error occurred while fetching the vehicles list.`);
        }
    }

    async deletedByID(vehicleId : string, loggedUserId : string)
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

            const vehicleExists = await this.prisma.vehicles.findUnique({
                where: {
                    id: vehicleId,
                    deletedAt: null
                },
                select: {
                    id: true
                }
            });

            if(!vehicleExists)
            {
                throw new NotFoundException(`Vehicle ID '${vehicleId}' was not found.`);
            }

            const deletedAt = await this.prisma.vehicles.update({
                where: {
                    userId: loggedUserId,
                    id: vehicleId
                },
                data: {
                    deletedAt: new Date()
                }
            });

            return {
                message: "Vehicle deleted successfully.",
                error: false,
                statusCode: 201
            };

        }
        catch(error)
        {
            if(error instanceof HttpException){
                throw error;
            }
            console.error(`An error occurred while trying to delete the vehicle. Error: ${error}`);
            throw new InternalServerErrorException(`An error occurred while trying to delete the vehicle.`);
        }
    }

    async getOneByID(vehicleId : string, loggedUserId : string)
    {
        try
        {
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

            const vehicleExists = await this.prisma.vehicles.findUnique({
                where: {
                    id: vehicleId,
                    deletedAt: null
                }
            });

            if(!vehicleExists)
            {
                throw new NotFoundException(`Vehicle ID '${vehicleId}' was not found.`);
            }

            return {
                data: {
                    id: vehicleExists.id,
                    make: vehicleExists.make,
                    model: vehicleExists.model,
                    year: vehicleExists.year,
                    color: vehicleExists.color,
                    vehicleImg: vehicleExists.vehicleImg,
                    plate: vehicleExists.plate,
                    userId: vehicleExists.userId,
                    trackingDeviceId: vehicleExists.trackingDeviceId,
                    createdAt: vehicleExists.createdAt,
                    updatedAt: vehicleExists.updatedAt,
                },
                error: false,
                statudCode: 200
            }
        }
        catch(error)
        {
            if(error instanceof HttpException){
                throw error;
            }
            console.error(`An internal error occurred while deleting the vehicle. Error: ${error}`);
            throw new InternalServerErrorException(`An internal error occurred while deleting the vehicle.`);
        }
    }
}
