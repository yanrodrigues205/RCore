import { ApiProperty } from '@nestjs/swagger';
import { 
    IsNotEmpty, 
    MinLength, 
    IsString, 
    IsOptional, 
    IsBoolean, 
    IsDateString 
} from 'class-validator';

export class TrackingDevicesRegisterDto {

    @ApiProperty({
        description: "The IMEI is a unique identification code for each device; providing this code is crucial in the event of theft.",
        example: "359123456789012"
    })
    @IsNotEmpty({ message: "IMEI is required." })
    @IsString()
    @MinLength(14, { message: "The IMEI has at least 14 digits." })
    imei: string;

    @ApiProperty({
        description: "The telephone number is a fundamental field for device identification, given that every device is linked to a mobile SIM card.",
        example: "(18) 998123-0021"
    })
    @IsNotEmpty({ message: "Phone is required." })
    @IsString()
    phone: string;

    @ApiProperty({
        description: "Field used to identify whether a piece of equipment is blocked or not.",
        example: "false",
        required: false
    })
    @IsOptional()
    @IsBoolean()
    blockade?: boolean;
    
    @ApiProperty({
        description: "Identification of the tracking device model; this may be required in some support cases.",
        example: "J16"
    })
    @IsNotEmpty({ message: "Model is required." })
    @IsString()
    model: string;
    
    @ApiProperty({
        description: "Protocol used by the equipment to send data to the application.",
        example: "GT06"
    })
    @IsNotEmpty({ message: "Protocol is required." })
    @IsString()
    protocol: string;

    @ApiProperty({
        description: "Installation date of that specific piece of equipment, with regard to the user responsible for it.",
        example: "2026-08-02T23:23:00-03:00",
        required: false
    })
    @IsOptional()
    @IsDateString({}, { message: "instaledAt must be a valid ISO date string." })
    instaledAt?: string;
}