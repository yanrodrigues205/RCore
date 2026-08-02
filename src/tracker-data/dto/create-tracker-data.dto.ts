export class CreateTrackerDataDto {
    imei: string;
    lat: number;
    lng: number;
    speed: number;
    course: number;
    satCount: number;
    gpsAt: Date;
}