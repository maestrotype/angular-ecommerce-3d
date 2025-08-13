import { Controller, Get, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { RecommendationsService } from './recommendations.service';
import { RecommendationProductDto } from './dto/recommendation-response.dto';
import { ApiResponse } from '../shared/models/api-response.model';
import { logRecommendationError, getUserFriendlyMessage } from './utils/error.utils';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get('similar/:productId')
  getSimilarProducts(
    @Param('productId') productId: string,
    @Query('limit') limit: string = '4'
  ): Observable<ApiResponse<{ productId: number; similarProducts: RecommendationProductDto[] }>> {
    return this.recommendationsService.getSimilarProducts(+productId, +limit).pipe(
      map(similarProducts => ({
        success: true,
        data: {
          productId: +productId,
          similarProducts
        }
      })),
      catchError(error => {
        if (error instanceof HttpException) {
          return of({
            success: false,
            error: error.message,
            message: error.message
          });
        }
        
        console.error('Unexpected error in getSimilarProducts:', error);
        return of({
          success: false,
          error: 'An unexpected error occurred while getting similar products',
          message: 'An unexpected error occurred while getting similar products'
        });
      })
    );
  }

  @Get('bought-together/:productId')
  getBoughtTogetherProducts(
    @Param('productId') productId: string,
    @Query('limit') limit: string = '4'
  ): Observable<ApiResponse<{ productId: number; boughtTogetherProducts: RecommendationProductDto[] }>> {
    return this.recommendationsService.getBoughtTogetherProducts(+productId, +limit).pipe(
      map(boughtTogetherProducts => ({
        success: true,
        data: {
          productId: +productId,
          boughtTogetherProducts
        }
      })),
      catchError(error => {
        if (error instanceof HttpException) {
          return of({
            success: false,
            error: error.message,
            message: error.message
          });
        }
        
        console.error('Unexpected error in getBoughtTogetherProducts:', error);
        return of({
          success: false,
          error: 'An unexpected error occurred while getting bought together products',
          message: 'An unexpected error occurred while getting bought together products'
        });
      })
    );
  }

  @Get('personalized')
  getPersonalizedRecommendations(
    @Query('userId') userId: string,
    @Query('limit') limit: string = '8'
  ): Observable<ApiResponse<{ userId?: number; recommendations: RecommendationProductDto[] }>> {
    const userIdNumber = userId ? +userId : undefined;
    
    return this.recommendationsService.getPersonalizedRecommendations(userIdNumber, +limit).pipe(
      map(recommendations => ({
        success: true,
        data: {
          userId: userIdNumber,
          recommendations
        }
      })),
      catchError(error => {
        if (error instanceof HttpException) {
          return of({
            success: false,
            error: error.message,
            message: error.message
          });
        }
        
        console.error('Unexpected error in getPersonalizedRecommendations:', error);
        return of({
          success: false,
          error: 'An unexpected error occurred while getting personalized recommendations',
          message: 'An unexpected error occurred while getting personalized recommendations'
        });
      })
    );
  }

  @Get('update')
  updateRecommendations(): Observable<ApiResponse<{ message: string; updatedCount: number }>> {
    return this.recommendationsService.updateRecommendations().pipe(
      map(result => ({
        success: true,
        data: result,
        message: result.message
      })),
      catchError(error => {
        if (error instanceof HttpException) {
          return of({
            success: false,
            error: error.message,
            message: error.message
          });
        }
        
        console.error('Unexpected error in updateRecommendations:', error);
        return of({
          success: false,
          error: 'An unexpected error occurred while updating recommendations',
          message: 'An unexpected error occurred while updating recommendations'
        });
      })
    );
  }
} 