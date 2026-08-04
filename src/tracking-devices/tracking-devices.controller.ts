import { Controller, Post, Get, Delete, HttpCode, HttpStatus, Body, Request, UseGuards, Query, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TrackingDevicesService } from './tracking-devices.service';
import { TrackingDevicesRegisterDto } from './dto/tracking-devices.register.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { PaginationDto } from './dto/tracking-devices.pagination.dto';


@ApiTags('Tracking Devices')
@ApiBearerAuth()
@Controller('tracking-devices')
export class TrackingDevicesController {
    constructor(private readonly trackingDevicesServices: TrackingDevicesService){}

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: `Register a New Tracking Devices`,
        description: `This endpoint instended for registering new modules, information essential for identifying each of the clients.`
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized. Missing or invalid Bearer Token.' 
    })
    async register(@Body() dto: TrackingDevicesRegisterDto, @Request() req : any){
        const loggedUserId = req.user.sub;
        return await this.trackingDevicesServices.register(dto, loggedUserId);
    }


    @Get('getall')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: `Get All Tracking Devices`,
        description: `This endpoint is designed to retrieve all tracking devices, this route supports pagination with a record limit.`
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized. Missing or invalid Bearer Token.' 
    })
    async getAll(@Query() paginationDto : PaginationDto, @Request() req : any)
    {
        const loggedUserId = req.user.sub;
        return await this.trackingDevicesServices.getAllByUserID(paginationDto, loggedUserId);
    }


    @Delete('delete/:trackingDevicesId')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: `Delete a Tracking Device`,
        description: `This endpoint is intended to delete a tracking device using its ID as a reference.`
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized. Missing or invalid Bearer Token.' 
    })
    async delete(
        @Param(`trackingDevicesId`) trackingDevicesId : string,
        @Request() req : any
    )
    {
        const loggedUserId = req.user.sub;
        return await this.trackingDevicesServices.deletedById(trackingDevicesId, loggedUserId);
    }


    @Get('getone/:trackingDevicesId')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: 'Get One a Tracking Device',
        description: 'This endpoint is designed to collect all information for a single tracking device, the query is performed using the ID.'
    })
    async getone(
        @Param(`trackingDevicesId`) trackingDevicesId : string,
        @Request() req : any
    )
    {
        const loggedUserId = req.user.sub;
        return await this.trackingDevicesServices.getOneByID(trackingDevicesId, loggedUserId);
    }

}
