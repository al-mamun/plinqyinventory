import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    // Generate embedding for the product
    const text = `${createProductDto.name} ${createProductDto.description || ''}`.trim();

    let embedding = null;
    try {
      const embeddingArray = await this.aiService.generateEmbedding(text);
      embedding = JSON.stringify(embeddingArray);
    } catch (error) {
      // Continue without embedding if AI service fails
      console.warn('Failed to generate embedding:', error.message);
    }

    const createData: any = {
      name: createProductDto.name,
      description: createProductDto.description,
      short_description: createProductDto.short_description,
      price_cents: Math.round((createProductDto.price || 0) * 100),
      compare_at_price_cents: createProductDto.compare_at_price ? Math.round(createProductDto.compare_at_price * 100) : null,
      sku: createProductDto.sku,
      barcode: createProductDto.barcode,
      quantity: createProductDto.quantity || 0,
      brand: createProductDto.brand,
      tags: createProductDto.tags,
      category_id: createProductDto.category_id,
      store_id: createProductDto.store_id,
      availability_status: 'in_stock',
      track_inventory: true,
      is_visible: true,
    };

    if (embedding) {
      createData.embedding = embedding;
    }

    return this.prisma.store_product.create({
      data: createData,
      include: {
        store: true,
      },
    });
  }

  async findAll(storeId?: string) {
    return this.prisma.store_product.findMany({
      where: storeId ? { store_id: storeId } : undefined,
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
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.store_product.findUnique({
      where: { id },
      include: {
        store: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: Partial<CreateProductDto>) {
    // Regenerate embedding if name or description changed
    let embedding = undefined;
    if (updateProductDto.name || updateProductDto.description) {
      const product = await this.findOne(id);
      const text = `${updateProductDto.name || product.name} ${updateProductDto.description || product.description || ''}`.trim();

      try {
        const embeddingArray = await this.aiService.generateEmbedding(text);
        embedding = JSON.stringify(embeddingArray);
      } catch (error) {
        console.warn('Failed to generate embedding:', error.message);
      }
    }

    const updateData: any = {};
    if (updateProductDto.name) updateData.name = updateProductDto.name;
    if (updateProductDto.description) updateData.description = updateProductDto.description;
    if (updateProductDto.short_description !== undefined) updateData.short_description = updateProductDto.short_description;
    if (updateProductDto.price !== undefined) updateData.price_cents = Math.round(updateProductDto.price * 100);
    if (updateProductDto.compare_at_price !== undefined) updateData.compare_at_price_cents = updateProductDto.compare_at_price ? Math.round(updateProductDto.compare_at_price * 100) : null;
    if (updateProductDto.sku !== undefined) updateData.sku = updateProductDto.sku;
    if (updateProductDto.barcode !== undefined) updateData.barcode = updateProductDto.barcode;
    if (updateProductDto.quantity !== undefined) updateData.quantity = updateProductDto.quantity;
    if (updateProductDto.brand !== undefined) updateData.brand = updateProductDto.brand;
    if (updateProductDto.tags !== undefined) updateData.tags = updateProductDto.tags;
    if (updateProductDto.category_id !== undefined) updateData.category_id = updateProductDto.category_id;
    if (embedding) updateData.embedding = embedding;

    return this.prisma.store_product.update({
      where: { id },
      data: updateData,
      include: {
        store: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.store_product.delete({
      where: { id },
    });
  }
}
