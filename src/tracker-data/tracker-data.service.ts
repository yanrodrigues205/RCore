import { Injectable, Logger } from '@nestjs/common';
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
            return await this.prisma.trackerData.create({
                data:{
                    imei: dto.imei,
                    lat: dto.lat,
                    lng: dto.lng,
                    speed: dto.speed,
                    course: dto.course,
                    satCount: dto.satCount,
                    gpsAt: dto.gpsAt
                },
            });
        }
        catch(error)
        {
            this.logger.error(`Erro ao salver pacote TCP do IMEI: "${dto.imei}"`, error);
        }
    }


    async getAllByUserId(paginationDto : PaginationDto, loggedUserId : string)
    {
        
    }


}
