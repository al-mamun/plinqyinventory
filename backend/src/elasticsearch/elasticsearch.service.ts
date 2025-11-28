import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name);
  private readonly PRODUCTS_INDEX = 'products';

  constructor(private readonly esService: NestElasticsearchService) {}

  async onModuleInit() {
    await this.createProductsIndex();
  }

  private async createProductsIndex() {
    try {
      const indexExists = await this.esService.indices.exists({
        index: this.PRODUCTS_INDEX,
      });

      if (!indexExists) {
        await this.esService.indices.create({
          index: this.PRODUCTS_INDEX,
          mappings: {
            properties: {
              id: { type: 'integer' },
              name: { type: 'text', analyzer: 'standard' },
              description: { type: 'text', analyzer: 'standard' },
              category: { type: 'keyword' },
              price: { type: 'float' },
              stock: { type: 'integer' },
              storeId: { type: 'integer' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' },
            },
          },
        });
        this.logger.log(`Created Elasticsearch index: ${this.PRODUCTS_INDEX}`);
      } else {
        this.logger.log(`Elasticsearch index already exists: ${this.PRODUCTS_INDEX}`);
      }
    } catch (error) {
      this.logger.error(`Failed to create Elasticsearch index: ${error.message}`);
    }
  }

  async indexProduct(product: any) {
    try {
      await this.esService.index({
        index: this.PRODUCTS_INDEX,
        id: product.id.toString(),
        document: {
          id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          stock: product.stock,
          storeId: product.storeId,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      });
      this.logger.log(`Indexed product: ${product.id}`);
    } catch (error) {
      this.logger.error(`Failed to index product ${product.id}: ${error.message}`);
    }
  }

  async searchProducts(query: string, limit: number = 20) {
    try {
      const result = await this.esService.search({
        index: this.PRODUCTS_INDEX,
        query: {
          multi_match: {
            query: query,
            fields: ['name^2', 'description', 'category'],
            fuzziness: 'AUTO',
          },
        },
        size: limit,
      });

      return result.hits.hits.map((hit: any) => ({
        ...(hit._source as any),
        score: hit._score,
      }));
    } catch (error) {
      this.logger.error(`Failed to search products: ${error.message}`);
      return [];
    }
  }

  async deleteProduct(productId: number) {
    try {
      await this.esService.delete({
        index: this.PRODUCTS_INDEX,
        id: productId.toString(),
      });
      this.logger.log(`Deleted product from index: ${productId}`);
    } catch (error) {
      this.logger.error(`Failed to delete product ${productId}: ${error.message}`);
    }
  }

  async updateProduct(product: any) {
    try {
      await this.esService.update({
        index: this.PRODUCTS_INDEX,
        id: product.id.toString(),
        doc: {
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          stock: product.stock,
          storeId: product.storeId,
          updatedAt: product.updatedAt,
        },
      });
      this.logger.log(`Updated product in index: ${product.id}`);
    } catch (error) {
      this.logger.error(`Failed to update product ${product.id}: ${error.message}`);
    }
  }

  async bulkIndexProducts(products: any[]) {
    try {
      const operations = products.flatMap((product) => [
        { index: { _index: this.PRODUCTS_INDEX, _id: product.id.toString() } },
        {
          id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          stock: product.stock,
          storeId: product.storeId,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      ]);

      const result = await this.esService.bulk({ operations });
      this.logger.log(`Bulk indexed ${products.length} products`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to bulk index products: ${error.message}`);
    }
  }
}
