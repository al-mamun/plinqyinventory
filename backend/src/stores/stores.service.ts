import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async create(createStoreDto: CreateStoreDto) {
    return this.prisma.store.create({
      data: createStoreDto,
    });
  }

  async findAll() {
    return this.prisma.store.findMany({
      include: {
        _count: {
          select: { store_product: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        store_product: true,
        _count: {
          select: { store_product: true },
        },
      },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    return store;
  }

  async findNearby(lat: number, lng: number, radius = 10) {
    // Using raw SQL for geospatial query
    const stores = await this.prisma.$queryRaw`
      SELECT
        id,
        name,
        address,
        latitude,
        longitude,
        ST_Distance(
          ST_MakePoint(longitude, latitude)::geography,
          ST_MakePoint(${lng}, ${lat})::geography
        ) / 1000 as distance_km
      FROM store
      WHERE ST_DWithin(
        ST_MakePoint(longitude, latitude)::geography,
        ST_MakePoint(${lng}, ${lat})::geography,
        ${radius * 1000}
      )
      ORDER BY distance_km
    `;

    return stores;
  }
}
