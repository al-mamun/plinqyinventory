import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

interface SearchOptions {
  query: string;
  lat?: number;
  lng?: number;
  radius?: number; // in kilometers
  limit?: number;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async search(options: SearchOptions) {
    const { query, lat, lng, radius = 10, limit = 20 } = options;

    try {
      // Generate embedding for search query
      const queryEmbedding = await this.aiService.generateEmbedding(query);

      // For now, we'll do a simple text search until we implement vector similarity
      // This is because Prisma doesn't natively support pgvector operations
      // We'll use raw SQL for vector search

      const products = await this.searchWithVectorSimilarity(
        queryEmbedding,
        lat,
        lng,
        radius,
        limit,
      );

      return {
        query,
        results: products,
        count: (products as any[]).length,
      };
    } catch (error) {
      this.logger.error(`Search failed: ${(error as any).message}`);

      // Fallback to text-based search if embedding fails
      return this.textBasedSearch(query, limit);
    }
  }

  private async searchWithVectorSimilarity(
    embedding: number[],
    lat?: number,
    lng?: number,
    radius?: number,
    limit = 20,
  ) {
    // Convert embedding to PostgreSQL array format
    const embeddingStr = `[${embedding.join(',')}]`;

    let sql = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price_cents,
        p.quantity,
        p.store_id,
        p.created_at,
        p.updated_at,
        s.name as "storeName",
        s.address as "storeAddress",
        s.latitude as "storeLat",
        s.longitude as "storeLng"
      FROM store_product p
      INNER JOIN store s ON p.store_id = s.id
      WHERE p.embedding IS NOT NULL
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Add geospatial filter if location provided
    if (lat !== undefined && lng !== undefined && radius) {
      sql += ` AND ST_DWithin(
        ST_MakePoint(s.longitude, s.latitude)::geography,
        ST_MakePoint($${paramIndex}, $${paramIndex + 1})::geography,
        $${paramIndex + 2}
      )`;
      params.push(lng, lat, radius * 1000); // Convert km to meters
      paramIndex += 3;
    }

    // Note: Vector similarity search requires pgvector extension
    // For now, we'll return all products and sort by basic relevance
    sql += ` ORDER BY p.created_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const results = await this.prisma.$queryRawUnsafe(sql, ...params);

    return results;
  }

  private async textBasedSearch(query: string, limit = 20) {
    const products = await this.prisma.store_product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            address: true,
            latitude: true,
            longitude: true,
          },
        },
      },
      take: limit,
      orderBy: {
        created_at: 'desc',
      },
    });

    return {
      query,
      results: products,
      count: products.length,
      fallback: true,
    };
  }
}
