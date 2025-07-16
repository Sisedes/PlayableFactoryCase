import { Request, Response } from 'express';
import Category from './categoriesModel';
import Product from '../Product/productModel';

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .select('name slug description icon parentCategory isActive sortOrder createdAt');

    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ 
          category: category._id,
          isActive: true 
        });
        
        return {
          ...category.toJSON(),
          productCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      data: categoriesWithCount
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Kategoriler getirilirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ 
      slug: slug.toLowerCase(),
      isActive: true 
    });

    if (!category) {
        res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }

    const productCount = await Product.countDocuments({ 
      category: category?._id,
      isActive: true 
    });

    //ilk 12 gelecekk
    const products = await Product.find({ 
      category: category?._id,
      isActive: true 
    })
    .populate('category', 'name slug')
    .select('name slug shortDescription pricing.basePrice pricing.salePrice images.url images.alt inventory.stock isActive createdAt')
    .sort({ createdAt: -1 })
    .limit(12); //12 de burada

    res.status(200).json({
      success: true,
      data: {
        category: {
          ...category?.toJSON(),
          productCount
        },
        products
      }
    });
  } catch (error) {
    console.error('Category by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Kategori detayı getirilirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

export const getCategoryStats = async (req: Request, res: Response) => {
  try {
    const totalCategories = await Category.countDocuments({ isActive: true });
    
    const topCategories = await Category.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { 
            $size: {
              $filter: {
                input: '$products',
                cond: { $eq: ['$$this.isActive', true] }
              }
            }
          }
        }
      },
      { $sort: { productCount: -1 } },
      { $limit: 5 },
      {
        $project: {
          name: 1,
          slug: 1,
          icon: 1,
          productCount: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCategories,
        topCategories
      }
    });
  } catch (error) {
    console.error('Category stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Kategori istatistikleri getirilirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
}; 