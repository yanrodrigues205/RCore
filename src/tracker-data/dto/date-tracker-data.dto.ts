import { IsOptional, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DateFilterDto {
    @ApiPropertyOptional({
        description: 'Date in AAAA-MM-DD format (ex: 2026-10-02).',
        example: '2026-10-02',
    })
    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'The date must be in YYYY-MM-DD format.',
    })
    date?: string;
}