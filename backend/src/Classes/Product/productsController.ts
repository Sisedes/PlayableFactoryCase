import { Request, Response } from 'express';
import Product from './productModel';
import Category from '../Categories/categoriesModel';

/**
 * @desc    
 * @route   get /api/products
 * @access  
 */
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minPrice,
      maxPrice,
      inStock
    } = req.query;

    const filter: any = { status: 'active' };

    // filtre
    if (category && category !== 'all') {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      }
    }

    // arama
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { 'tags': { $regex: search, $options: 'i' } }
      ];
    }

    // fiyat sınırı
    if (minPrice || maxPrice) {
      filter['price'] = {};
      if (minPrice) filter['price'].$gte = Number(minPrice);
      if (maxPrice) filter['price'].$lte = Number(maxPrice);
    }

    // stok
    if (inStock === 'true') {
      filter['stock'] = { $gt: 0 };
    }

    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;


    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit))); // Max 50 ürün
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .select('name slug shortDescription price salePrice images stock isActive createdAt statistics tags')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limitNum);

    res.status(200).json({
      success: true,
      count: products.length,
      total: totalProducts,
      pages: totalPages,
      currentPage: pageNum,
      data: products,
      filters: {
        category,
        search,
        sortBy,
        sortOrder,
        minPrice,
        maxPrice,
        inStock
      }
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Ürünler getirilirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * @desc    
 * @route   get /api/products/:id
 * @access  
 */
export const getProductById = async (req: Request, res: Response):Promise<void> =>  {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('category', 'name slug icon description')
      .select('-__v');

    if (!product) {
        res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    await Product.findByIdAndUpdate(id, {
      $inc: { 'statistics.views': 1 }
    });

    // 4 ürün max
    const relatedProducts = await Product.find({
      category: product?.category,
      _id: { $ne: product?._id },
      status: 'active'
    })
    .populate('category', 'name slug')
    .select('name slug shortDescription price salePrice images stock')
    .limit(4); //4 burada

    res.status(200).json({
      success: true,
      data: {
        product,
        relatedProducts
      }
    });
  } catch (error) {
    console.error('Product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Ürün detayı getirilirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * @desc    
 * @route   get /api/products/category/:categoryId
 * @access  
 */
export const getProductsByCategory = async (req: Request, res: Response):Promise<void> => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const category = await Category.findById(categoryId);
    if (!category || !category.isActive) {
        res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }

    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find({
      category: categoryId,
      status: 'active'
    })
    .populate('category', 'name slug')
    .select('name slug shortDescription price salePrice images stock isActive createdAt statistics')
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

    const totalProducts = await Product.countDocuments({
      category: categoryId,
      status: 'active'
    });

    res.status(200).json({
      success: true,
      count: products.length,
      total: totalProducts,
      pages: Math.ceil(totalProducts / limitNum),
      currentPage: pageNum,
      category: {
        name: category?.name,
        slug: category?.slug,
        description: category?.description
      },
      data: products
    });
  } catch (error) {
    console.error('Products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Kategori ürünleri getirilirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * @desc    
 * @route   get /api/products/popular
 * @access  
 */
export const getPopularProducts = async (req: Request, res: Response) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({ status: 'active' })
      .populate('category', 'name slug')
      .select('name slug shortDescription price salePrice images stock statistics')
      .sort({ 'statistics.views': -1, 'statistics.sales': -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Popular products error:', error);
    res.status(500).json({
      success: false,
      message: 'Popüler ürünler getirilirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * @desc    
 * @route   get /api/products/latest
 * @access  
 */
export const getLatestProducts = async (req: Request, res: Response) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({ status: 'active' })
      .populate('category', 'name slug')
      .select('name slug shortDescription price salePrice images stock')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Latest products error:', error);
    res.status(500).json({
      success: false,
      message: 'Yeni ürünler getirilirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * @desc    
 * @route   post  /api/products
 * @access  
 */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      shortDescription,
      category,
      price,
      salePrice,
      sku,
      stock,
      trackQuantity = true,
      lowStockThreshold = 5,
      images,
      tags,
      status = 'draft',
      isFeatured = false
    } = req.body;

    console.log('Backend\'e gelen status değeri:', status);
    console.log('Backend\'e gelen tüm body:', req.body);

    if (!name || !description || !category || !price || !sku) {
      res.status(400).json({
        success: false,
        message: 'Gerekli alanlar eksik: name, description, category, price, sku'
      });
      return;
    }

    const existingSku = await Product.findOne({ sku });
    if (existingSku) {
      res.status(400).json({
        success: false,
        message: 'Bu SKU zaten kullanılıyor'
      });
      return;
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      res.status(400).json({
        success: false,
        message: 'Geçersiz kategori'
      });
      return;
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    let uniqueSlug = slug;
    let counter = 1;
    while (await Product.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    if (salePrice && salePrice >= price) {
      res.status(400).json({
        success: false,
        message: 'İndirimli fiyat normal fiyattan düşük olmalıdır'
      });
      return;
    }

    const uploadedImages: any[] = [];
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file: Express.Multer.File, index: number) => {
        uploadedImages.push({
          url: `/uploads/products/${file.filename}`,
          alt: `${name} - Görsel ${index + 1}`,
          isPrimary: index === 0
        });
      });
    }

    const product = new Product({
      name,
      slug: uniqueSlug,
      description,
      shortDescription,
      category,
      price,
      salePrice,
      sku,
      stock: trackQuantity ? stock : 0,
      trackQuantity,
      lowStockThreshold,
      images: uploadedImages.length > 0 ? uploadedImages : (images || []),
      tags: tags || [],
      status,
      isFeatured
    });

    const savedProduct = await product.save();
    await savedProduct.populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Ürün başarıyla oluşturuldu',
      data: savedProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Ürün oluşturulurken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * @desc    
 * @route   put /api/products/:id
 * @access  
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
      return;
    }

    if (updateData.sku && updateData.sku !== product.sku) {
      const existingSku = await Product.findOne({ sku: updateData.sku });
      if (existingSku) {
        res.status(400).json({
          success: false,
          message: 'Bu SKU zaten kullanılıyor'
        });
        return;
      }
    }

    if (updateData.name && updateData.name !== product.name) {
      const newSlug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      let uniqueSlug = newSlug;
      let counter = 1;
      while (await Product.findOne({ slug: uniqueSlug, _id: { $ne: id } })) {
        uniqueSlug = `${newSlug}-${counter}`;
        counter++;
      }
      updateData.slug = uniqueSlug;
    }

    if (updateData.salePrice && updateData.price && updateData.salePrice >= updateData.price) {
      res.status(400).json({
        success: false,
        message: 'İndirimli fiyat normal fiyattan düşük olmalıdır'
      });
      return;
    }

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const uploadedImages: any[] = [];
      req.files.forEach((file: Express.Multer.File, index: number) => {
        uploadedImages.push({
          url: `/uploads/products/${file.filename}`,
          alt: `${updateData.name || product.name} - Görsel ${index + 1}`,
          isMain: index === 0
        });
      });
      updateData.images = [...(product.images || []), ...uploadedImages];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    res.status(200).json({
      success: true,
      message: 'Ürün başarıyla güncellendi',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Ürün güncellenirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * @desc    
 * @route   delete /api/products/:id
 * @access  
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
      return;
    }

    await Product.findByIdAndUpdate(id, { status: 'inactive' });

    res.status(200).json({
      success: true,
      message: 'Ürün başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Ürün silinirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
}; 