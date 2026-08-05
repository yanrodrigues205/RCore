import { Controller, HttpStatus, Post, Get, Delete, Query, Param, HttpCode, UseGuards, Body, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { VehiclesRegisterDto } from './dto/vehicles.register.dto';
import { PaginationDto } from 'src/tracking-devices/dto/tracking-devices.pagination.dto';

@ApiTags('Vehicles')
@ApiBearerAuth()
@Controller('vehicles')
export class VehiclesController {
    constructor(private readonly vehicleServices: VehiclesService){
    }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: `Register a New Vehicle`,
        description: `This endpoint is for creating vehicles within the system. [Required: Tracking Device Id]`
    })
    async register(@Body() dto : VehiclesRegisterDto, @Request() req : any)
    {
        const loggedUserId = req.user.sub;
        return await this.vehicleServices.register(dto, loggedUserId);
    }

    @Get('getall')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: `Get all Vehicles`,
        description: `This endpoint is used to retrieve all available vehicles, the route was created with pagination.`
    })
    async getall(@Query() paginationDto : PaginationDto, @Request() req : any)
    {
        const loggedUserId = req.user.sub;
        return await this.vehicleServices.getAllByUserId(paginationDto, loggedUserId);
    }

    @Delete('delete/:vehicleId')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: `Delete a Vehicle`,
        description: `This endpoint focuses on deleting a specific vehicle.`
    })
    async delete(
        @Param(`vehicleId`) vehicleId : string,
        @Request() req : any
    )
    {
        const loggedUserId = req.user.sub;
        return await this.vehicleServices.deletedByID(vehicleId, loggedUserId);
    }

    @Get('getone/:vehicleId')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: 'Get One a Vehicle',
        description: 'This endpoint is designed to collect all information for a single tvehicle, the query is performed using the ID.'
    })
    async getone(
        @Param(`vehicleId`) vehicleId : string,
        @Request() req : any
    )
    {
        const loggedUserId = req.user.sub;
        return await this.vehicleServices.getOneByID(vehicleId, loggedUserId);
    }

}
