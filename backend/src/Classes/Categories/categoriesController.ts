import { Request, Response } from 'express';
import Category from './categoriesModel';
import Product from '../Product/productModel';
import { deleteFile } from '../../config/multer';
import path from 'path';

const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .select('name slug description image isActive sortOrder createdAt');

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

export const getAllCategoriesForAdmin = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find()
      .sort({ sortOrder: 1, name: 1 })
      .select('name slug description image isActive sortOrder createdAt');

    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ 
          category: category._id
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
    console.error('Admin categories fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Kategoriler getirilirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Kategori adı ve açıklaması gereklidir'
      });
    }

    const lastCategory = await Category.findOne().sort({ sortOrder: -1 });
    const nextSortOrder = lastCategory ? lastCategory.sortOrder + 1 : 0;

    let slug = createSlug(name);
    let counter = 1;
    let originalSlug = slug;

    while (await Category.findOne({ slug })) {
      slug = `${originalSlug}-${counter}`;
      counter++;
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/categories/${req.file.filename}`;
    }

    const category = new Category({
      name,
      slug,
      description,
      image: imageUrl,
      sortOrder: nextSortOrder,
      isActive: true
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Kategori başarıyla oluşturuldu',
      data: category
    });
  } catch (error) {
    console.error('Category creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Kategori oluşturulurken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, sortOrder, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }

    const updateData: any = {};
    
    if (name && name !== category.name) {
      updateData.name = name;
      let slug = createSlug(name);
      let counter = 1;
      let originalSlug = slug;

      while (await Category.findOne({ slug, _id: { $ne: id } })) {
        slug = `${originalSlug}-${counter}`;
        counter++;
      }
      updateData.slug = slug;
    }

    if (description !== undefined) updateData.description = description;
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder) || 0;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (req.file) {
      if (category.image) {
        try {
          const oldImagePath = path.join(process.cwd(), category.image);
          await deleteFile(oldImagePath);
        } catch (error) {
          console.error('Eski kategori resmi silinirken hata:', error);
        }
      }
      updateData.image = `/uploads/categories/${req.file.filename}`;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Kategori başarıyla güncellendi',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Category update error:', error);
    res.status(500).json({
      success: false,
      message: 'Kategori güncellenirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }

    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Bu kategoride ${productCount} ürün bulunmaktadır. Önce ürünleri başka bir kategoriye taşıyın.`
      });
    }

    if (category.image) {
      try {
        const imagePath = path.join(process.cwd(), category.image);
        await deleteFile(imagePath);
      } catch (error) {
        console.error('Kategori resmi silinirken hata:', error);
      }
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Kategori başarıyla silindi'
    });
  } catch (error) {
    console.error('Category deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Kategori silinirken hata oluştu',
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