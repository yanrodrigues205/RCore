import { ApiProperty } from "@nestjs/swagger";
import {IsNotEmpty, MinLength, IsString, IsOptional, IsNumber} from 'class-validator';

export class VehiclesRegisterDto{

    @ApiProperty({
        description: "Manufacter or make of hte vehicle.",
        example: "Toyota"
    })
    @IsNotEmpty({ message: "Make is required."})
    @IsString()
    @MinLength(3, { message: "The Make has at least 3 letters." })
    make : string;


    @ApiProperty({
        description: "Model name of the vehicle.",
        example: "Corolla"
    })
    @IsNotEmpty({ message: "Model is required."})
    @IsString()
    @MinLength(3, { message: "The Model has at least 3 letters." })
    model : string;

    @ApiProperty({
        description: 'Manufacturing year of the vehicle.',
        example: 2024
    })
    @IsNotEmpty({ message: "Year is required."})
    @IsNumber()
    year : number;

    @ApiProperty({
        description: 'Primary color of the vehicle.',
        example: 'Preto'
    })
    @IsNotEmpty({ message: "Color is required."})
    @IsString()
    color : string;

    @ApiProperty({
        description: 'Registration Plate of the vehicle.',
        example: 'AJD-9A04'
    })
    @IsNotEmpty({ message: "Plate is required."})
    @IsString()
    plate : string;

    @ApiProperty({
        description: 'URL or base64 string representing the vehicle image.',
        example: 'https://example.com/images/vehicle-123.jpg',
        required: false
    })
    @IsOptional()
    @IsString()
    vehicleImg? : string;

    @ApiProperty({
        description: 'Unique identifier for the assigned tracking device.',
        example: 'f4c9c6c2-ca26-452a-b478-1991643c187f'
    })
    @IsNotEmpty({ message: "Tracking Device ID is required." })
    @IsString()
    trackingDeviceId : string;
}