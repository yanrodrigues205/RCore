import { Controller, HttpStatus, Post, Get, Delete, Query, Param, HttpCode, UseGuards, Body, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TrackerDataService } from './tracker-data.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { PaginationDto } from 'src/tracking-devices/dto/tracking-devices.pagination.dto';
import { DateFilterPaginationDto } from './dto/';

@ApiTags("Tracker Data")
@ApiBearerAuth()
@Controller('tracker-data')
export class TrackerDataController {
    constructor(private readonly trackerDataService : TrackerDataService){
    }

    @Get('getAllbyVehicleId/:vehicleId')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: `Get all by vehicle ID`,
        description: `This endpoint is designed to retrieve all data packets received from a device, the search is performed using the vehicle ID.`
    })
    async getAllByVehicleId(
        @Query() dateFilterPaginationDto : DateFilterPaginationDto,
        @Param(`vehicleId`) vehicleId : string,
        @Request() req : any
    ){
        const loggedUserId = req.user.sub;
        return await this.trackerDataService.getAllByUserId(dateFilterPaginationDto, vehicleId, true, loggedUserId);
    }


    @Get('getAllbyTrackingDeviceId/:trackingDeviceId')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: `Get all by tracking device ID`,
        description: `This endpoint is designed to retrieve all data packets received from a device, the search is performed using the tracking device ID.`
    })
    async getAllByTrackerDeviceId(
        @Query() dateFilterPaginationDto : DateFilterPaginationDto,
        @Param(`trackingDeviceId`) trackingDeviceId : string,
        @Request() req : any
    ){
        const loggedUserId = req.user.sub;
        return await this.trackerDataService.getAllByUserId(dateFilterPaginationDto, trackingDeviceId, false, loggedUserId);
    }

    @Get('getLatestbyVehicleId/:vehicleId')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: `Get latest by vehicle ID`,
        description: `This endpoint is designed to retrieve the latest batch of data sent by the device, the retrieval is performed using the vehicle ID.`
    })
    async getLatestByVehicleId(
        @Param(`vehicleId`) vehicleId : string,
        @Request() req : any
    ){
        const loggedUserId = req.user.sub;
        return await this.trackerDataService.getlatest(vehicleId, true, loggedUserId);
    }

    @Get('getLatestbyTrackingDeviceId/:trackingDeviceId')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: `Get latest by tracking device id ID`,
        description: `This endpoint is designed to retrieve the latest batch of data sent by the device, the retrieval is performed using the tracking device ID.`
    })
    async getLatestByTrackingDeviceId(
        @Param(`trackingDeviceId`) trackingDeviceId : string,
        @Request() req : any
    ){
        const loggedUserId = req.user.sub;
        return await this.trackerDataService.getlatest(trackingDeviceId, false, loggedUserId);
    }
}
