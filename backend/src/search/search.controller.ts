import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Semantic product search' })
  @ApiResponse({ status: 200, description: 'Returns search results with products and stores' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query', example: 'smartphone' })
  @ApiQuery({ name: 'lat', required: false, description: 'Latitude for location-based search', example: 40.7589 })
  @ApiQuery({ name: 'lng', required: false, description: 'Longitude for location-based search', example: -73.9851 })
  @ApiQuery({ name: 'radius', required: false, description: 'Search radius in kilometers', example: 10 })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results', example: 20 })
  async search(
    @Query('q') query: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius') radius?: string,
    @Query('limit') limit?: string,
  ) {
    return this.searchService.search({
      query: query || '',
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      radius: radius ? parseFloat(radius) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }
}
