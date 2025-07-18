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
      .select('name slug shortDescription price salePrice images stock isActive createdAt statistics tags averageRating reviewCount')
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
    .select('name slug shortDescription price salePrice images stock isActive createdAt statistics averageRating reviewCount')
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

    const products = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'items.product',
          as: 'orderItems'
        }
      },
      {
        $addFields: {
          totalSales: {
            $sum: {
              $map: {
                input: '$orderItems',
                as: 'order',
                in: {
                  $sum: {
                    $map: {
                      input: {
                        $filter: {
                          input: '$$order.items',
                          as: 'item',
                          cond: { $eq: ['$$item.product', '$$CURRENT._id'] }
                        }
                      },
                      as: 'item',
                      in: '$$item.quantity'
                    }
                  }
                }
              }
            }
          }
        }
      },
      { $sort: { totalSales: -1, 'statistics.views': -1 } },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $addFields: {
          category: { $arrayElemAt: ['$category', 0] }
        }
      },
      {
        $project: {
          name: 1,
          slug: 1,
          shortDescription: 1,
          price: 1,
          salePrice: 1,
          images: 1,
          stock: 1,
          statistics: 1,
          totalSales: 1,
          averageRating: 1,
          reviewCount: 1,
          'category.name': 1,
          'category.slug': 1
        }
      }
    ]);

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
    const { limit = 4 } = req.query;

    const products = await Product.find({ status: 'active' })
      .populate('category', 'name slug')
      .select('name slug shortDescription price salePrice images stock averageRating reviewCount')
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
 * @route   get /api/products/admin/all
 * @access  
 */
export const getAllProductsForAdmin = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 50,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status
    } = req.query;

    const filter: any = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (category && category !== 'all') {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      }
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { 'tags': { $regex: search, $options: 'i' } }
      ];
    }

    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit))); 
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .select('name slug shortDescription description price salePrice images stock status sku lowStockThreshold variants createdAt updatedAt')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    console.log('Admin ürünleri getirildi:', products.length);
    console.log('İlk ürün örneği:', products[0] ? {
      name: products[0].name,
      variants: products[0].variants,
      variantsCount: products[0].variants?.length || 0
    } : 'Ürün yok');

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
        status
      }
    });
  } catch (error) {
    console.error('Admin products fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin ürünleri getirilirken hata oluştu',
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
      status = 'active',
      isFeatured = false,
      variants
    } = req.body;



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
      variants: variants || [],
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
  } catch (error: any) {
    console.error('Create product error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: validationErrors.join(', ')
      });
      return;
    }
    
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

/**
 * @desc    
 * @route   put /api/products/admin/:id
 * @access  
 */
export const updateProductAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const files = req.files as Express.Multer.File[];

    console.log('=== UPDATE PRODUCT ADMIN DEBUG ===');
    console.log('Product ID:', id);
    console.log('Files count:', files ? files.length : 0);
    console.log('UpdateData keys:', Object.keys(updateData));
    console.log('UpdateData.images exists:', !!updateData.images);
    console.log('UpdateData.images type:', typeof updateData.images);
    if (updateData.images) {
      console.log('UpdateData.images length:', Array.isArray(updateData.images) ? updateData.images.length : 'Not array');
    }

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    console.log('Existing product images count:', existingProduct.images ? existingProduct.images.length : 0);

    if (files && files.length > 0) {
      const newImages = files.map(file => ({
        url: `/uploads/products/${file.filename}`,
        alt: file.originalname,
        isMain: false
      }));

      console.log('New images to add:', newImages.length);
      console.log('New images:', newImages);

      if (updateData.images && Array.isArray(updateData.images)) {
        console.log('Using frontend images + new files');
        updateData.images = [...updateData.images, ...newImages];
      } else {
        console.log('Using existing images + new files');
        updateData.images = [...(existingProduct.images || []), ...newImages];
      }
    } else {
      console.log('No new files uploaded');
      if (!updateData.images) {
        updateData.images = existingProduct.images || [];
      }
    }

    console.log('Final images count:', updateData.images ? updateData.images.length : 0);
    console.log('=== END DEBUG ===');

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
    return;
  } catch (error: any) {
    console.error('Update product admin error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: validationErrors.join(', ')
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Ürün güncellenirken hata oluştu'
    });
    return;
  }
};

/**
 * @desc    
 * @route   delete /api/products/admin/:id
 * @access  
 */
export const deleteProductAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Ürün başarıyla silindi'
    });
    return;
  } catch (error) {
    console.error('Delete product admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Ürün silinirken hata oluştu'
    });
    return;
  }
};

/**
 * @desc    
 * @route   put /api/products/admin/bulk
 * @access  
 */
export const bulkUpdateProducts = async (req: Request, res: Response) => {
  try {
    const { productIds, action } = req.body;

    console.log('Bulk update request:', { productIds, action });

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli ürün ID\'leri gerekli'
      });
    }

    if (!['activate', 'deactivate', 'delete'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir işlem belirtin (activate, deactivate, delete)'
      });
    }

    const mongoose = require('mongoose');
    const objectIds = productIds.map(id => {
      try {
        return new mongoose.Types.ObjectId(id);
      } catch (error) {
        console.error('Invalid ObjectId:', id);
        throw new Error(`Geçersiz ürün ID: ${id}`);
      }
    });

    console.log('Converted ObjectIds:', objectIds);

    let result;
    switch (action) {
      case 'activate':
        result = await Product.updateMany(
          { _id: { $in: objectIds } },
          { status: 'active' }
        );
        break;
      case 'deactivate':
        result = await Product.updateMany(
          { _id: { $in: objectIds } },
          { status: 'inactive' }
        );
        break;
      case 'delete':
        result = await Product.deleteMany({ _id: { $in: objectIds } });
        break;
    }

    console.log('Bulk update result:', result);

    res.status(200).json({
      success: true,
      message: `${productIds.length} ürün başarıyla ${action === 'delete' ? 'silindi' : action === 'activate' ? 'aktif yapıldı' : 'pasif yapıldı'}`,
      data: result
    });
    return;
  } catch (error: any) {
    console.error('Bulk update products error:', error);
    res.status(500).json({
      success: false,
      message: `Toplu işlem sırasında hata oluştu: ${error.message || 'Bilinmeyen hata'}`
    });
    return;
  }
};

/**
 * @desc    
 * @route   get /api/products/test/images
 * @access  
 */
export const testProductImages = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({}).populate('category', 'name slug');
    
    const productsWithImages = products.map(product => ({
      _id: product._id,
      name: product.name,
      images: product.images,
      imageCount: product.images?.length || 0
    }));

    res.status(200).json({
      success: true,
      data: productsWithImages
    });
  } catch (error) {
    console.error('Test product images error:', error);
    res.status(500).json({
      success: false,
      message: 'Test sırasında hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   delete /api/products/admin/:id/images/:imageId
 * @access  
 */
export const deleteProductImage = async (req: Request, res: Response) => {
  try {
    const { id, imageId } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    const imageToDelete = product.images.find(img => img._id?.toString() === imageId);
    if (!imageToDelete) {
      return res.status(404).json({
        success: false,
        message: 'Resim bulunamadı'
      });
    }

    if (imageToDelete.isMain) {
      return res.status(400).json({
        success: false,
        message: 'Ana resim silinemez. Önce başka bir resmi ana resim yapın.'
      });
    }

    product.images = product.images.filter(img => img._id?.toString() !== imageId);
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Resim başarıyla silindi',
      data: product
    });
    return;
  } catch (error) {
    console.error('Delete product image error:', error);
    res.status(500).json({
      success: false,
      message: 'Resim silinirken hata oluştu'
    });
    return;
  }
};

/**
 * @desc    
 * @route   put /api/products/admin/:id/images/:imageId/set-main
 * @access  
 */
export const setMainImage = async (req: Request, res: Response) => {
  try {
    const { id, imageId } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    product.images.forEach(img => {
      img.isMain = false;
    });

    const imageIndex = product.images.findIndex(img => img._id?.toString() === imageId);
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Resim bulunamadı'
      });
    }

    product.images[imageIndex].isMain = true;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Ana resim başarıyla ayarlandı',
      data: product
    });
    return;
  } catch (error) {
    console.error('Set main image error:', error);
    res.status(500).json({
      success: false,
      message: 'Ana resim ayarlanırken hata oluştu'
    });
    return;
  }
}; 

/**
 * @desc    
 * @route   get /api/products/admin/:id/stock-history
 * @access  
 */
export const getStockHistory = async (req: Request, res: Response) => {
  try {
    const { id, variantId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const StockHistory = require('./stockHistoryModel').default;
    
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = { product: id };
    if (variantId) {
      filter.variantId = variantId;
    }

    const history = await StockHistory.find(filter)
      .populate('performedBy', 'firstName lastName email')
      .sort({ performedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalHistory = await StockHistory.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: history,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalHistory / limitNum),
        totalHistory,
        hasNextPage: pageNum < Math.ceil(totalHistory / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get stock history error:', error);
    res.status(500).json({
      success: false,
      message: 'Stok geçmişi getirilirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   put /api/products/admin/:id/stock
 * @access  
 */
export const updateStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newStock, reason, notes } = req.body;
    const userId = req.user?.userId;

    if (typeof newStock !== 'number' || newStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir stok miktarı girin'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    const previousStock = product.stock;
    const changeAmount = newStock - previousStock;

    const StockHistory = require('./stockHistoryModel').default;
    await StockHistory.create({
      product: id,
      previousStock,
      newStock,
      changeAmount,
      changeType: 'manual',
      reason,
      performedBy: userId,
      notes
    });

    product.stock = newStock;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Stok başarıyla güncellendi',
      data: {
        product,
        stockChange: {
          previousStock,
          newStock,
          changeAmount
        }
      }
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Stok güncellenirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   get /api/products/admin/low-stock-alerts
 * @access  
 */
export const getLowStockAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const lowStockProducts = await Product.find({
      $expr: {
        $and: [
          { $lte: ['$stock', { $ifNull: ['$lowStockThreshold', 10] }] },
          { $gt: ['$stock', 0] }
        ]
      },
      status: 'active'
    })
    .populate('category', 'name slug')
    .select('name sku stock lowStockThreshold category status')
    .skip(skip)
    .limit(limitNum);

    const outOfStockProducts = await Product.find({
      stock: 0,
      status: 'active'
    })
    .populate('category', 'name slug')
    .select('name sku stock lowStockThreshold category status')
    .skip(skip)
    .limit(limitNum);

    const productsWithLowStockVariants = await Product.find({
      'variants.stock': { $lte: 5, $gt: 0 },
      status: 'active'
    })
    .populate('category', 'name slug')
    .select('name sku stock lowStockThreshold category status variants');

    const productsWithOutOfStockVariants = await Product.find({
      'variants.stock': 0,
      status: 'active'
    })
    .populate('category', 'name slug')
    .select('name sku stock lowStockThreshold category status variants');

    const totalLowStock = await Product.countDocuments({
      $or: [
        {
          $expr: {
            $and: [
              { $lte: ['$stock', { $ifNull: ['$lowStockThreshold', 10] }] },
              { $gt: ['$stock', 0] }
            ]
          },
          status: 'active'
        },
        {
          'variants.stock': { $lte: 5, $gt: 0 },
          status: 'active'
        }
      ]
    });

    const totalOutOfStock = await Product.countDocuments({
      $or: [
        {
          stock: 0,
          status: 'active'
        },
        {
          'variants.stock': 0,
          status: 'active'
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        lowStockProducts,
        outOfStockProducts,
        productsWithLowStockVariants,
        productsWithOutOfStockVariants,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalLowStock / limitNum),
          totalLowStock,
          totalOutOfStock,
          hasNextPage: pageNum * limitNum < totalLowStock,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get low stock alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Düşük stok uyarıları getirilirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   get /api/products/admin/stock-statistics
 * @access  
 */
export const getStockStatistics = async (req: Request, res: Response) => {
  try {
    const { period = '30' } = req.query; 
    const days = parseInt(period as string);

    const StockHistory = require('./stockHistoryModel').default;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stockChanges = await StockHistory.aggregate([
      {
        $match: {
          performedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$performedAt" }
          },
          totalChanges: { $sum: 1 },
          totalIncrease: {
            $sum: {
              $cond: [{ $gt: ["$changeAmount", 0] }, "$changeAmount", 0]
            }
          },
          totalDecrease: {
            $sum: {
              $cond: [{ $lt: ["$changeAmount", 0] }, { $abs: "$changeAmount" }, 0]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const totalProducts = await Product.countDocuments({ status: 'active' });
    const lowStockProducts = await Product.countDocuments({
      $expr: {
        $and: [
          { $lte: ['$stock', { $ifNull: ['$lowStockThreshold', 10] }] },
          { $gt: ['$stock', 0] }
        ]
      },
      status: 'active'
    });
    const outOfStockProducts = await Product.countDocuments({
      stock: 0,
      status: 'active'
    });



    const topStockChanges = await StockHistory.aggregate([
      {
        $match: {
          performedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$product",
          totalChanges: { $sum: 1 },
          totalChangeAmount: { $sum: "$changeAmount" }
        }
      },
      {
        $sort: { totalChanges: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          productName: '$product.name',
          productSku: '$product.sku',
          totalChanges: 1,
          totalChangeAmount: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        stockChanges,
        summary: {
          totalProducts,
          lowStockProducts,
          outOfStockProducts,
          period: days
        },
        topStockChanges
      }
    });
  } catch (error) {
    console.error('Get stock statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Stok istatistikleri getirilirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   put /api/products/:id/variants
 * @access  
 */
export const updateProductVariants = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let variants;

    if (req.body.variants) {
      try {
        variants = JSON.parse(req.body.variants);
      } catch (error) {
        res.status(400).json({
          success: false,
          message: 'Varyasyon verisi geçersiz JSON formatında'
        });
        return;
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Varyasyon verisi bulunamadı'
      });
      return;
    }

    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
      return;
    }

    if (!Array.isArray(variants)) {
      res.status(400).json({
        success: false,
        message: 'Varyasyonlar dizi formatında olmalıdır'
      });
      return;
    }

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      
      if (!variant.name || !variant.name.trim()) {
        res.status(400).json({
          success: false,
          message: `Varyasyon ${i + 1}: Varyant adı gereklidir`
        });
        return;
      }

      if (!variant.sku || !variant.sku.trim()) {
        res.status(400).json({
          success: false,
          message: `Varyasyon ${i + 1}: SKU gereklidir`
        });
        return;
      }

      if (variant.stock < 0) {
        res.status(400).json({
          success: false,
          message: `Varyasyon ${i + 1}: Stok negatif olamaz`
        });
        return;
      }

      if (variant.price && variant.price < 0) {
        res.status(400).json({
          success: false,
          message: `Varyasyon ${i + 1}: Fiyat negatif olamaz`
        });
        return;
      }

      if (variant.salePrice && variant.salePrice < 0) {
        res.status(400).json({
          success: false,
          message: `Varyasyon ${i + 1}: İndirimli fiyat negatif olamaz`
        });
        return;
      }

      if (variant.salePrice && variant.price && variant.salePrice >= variant.price) {
        res.status(400).json({
          success: false,
          message: `Varyasyon ${i + 1}: İndirimli fiyat normal fiyattan düşük olmalıdır`
        });
        return;
      }

      if (!Array.isArray(variant.options) || variant.options.length === 0) {
        res.status(400).json({
          success: false,
          message: `Varyasyon ${i + 1}: En az bir seçenek gereklidir`
        });
        return;
      }

      for (let j = 0; j < variant.options.length; j++) {
        const option = variant.options[j];
        if (!option.name || !option.name.trim()) {
          res.status(400).json({
            success: false,
            message: `Varyasyon ${i + 1}, Seçenek ${j + 1}: Seçenek adı gereklidir`
          });
          return;
        }
        if (!option.value || !option.value.trim()) {
          res.status(400).json({
            success: false,
            message: `Varyasyon ${i + 1}, Seçenek ${j + 1}: Seçenek değeri gereklidir`
          });
          return;
        }
      }
    }

    const defaultVariants = variants.filter(v => v.isDefault);
    if (defaultVariants.length === 0 && variants.length > 0) {
      variants[0].isDefault = true;
    } else if (defaultVariants.length > 1) {
      variants.forEach((variant, index) => {
        variant.isDefault = index === 0;
      });
    }

    if (req.files && Array.isArray(req.files)) {
      const variantImages = req.files as Express.Multer.File[];
      
      variantImages.forEach((file, index) => {
        const variantIndex = parseInt(file.fieldname.split('-')[1]);
        if (variants[variantIndex]) {
          variants[variantIndex].image = `/uploads/products/${file.filename}`;
        }
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { variants },
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    res.status(200).json({
      success: true,
      message: 'Ürün varyasyonları başarıyla güncellendi',
      data: updatedProduct
    });
  } catch (error: any) {
    console.error('Update product variants error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: validationErrors.join(', ')
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Ürün varyasyonları güncellenirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * @desc    
 * @route   get /api/products/:id/variants
 * @access  
 */
export const getProductVariants = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).select('name variants');
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        productName: product.name,
        variants: product.variants || []
      }
    });
  } catch (error) {
    console.error('Get product variants error:', error);
    res.status(500).json({
      success: false,
      message: 'Ürün varyasyonları getirilirken hata oluştu'
    });
  }
}; 

/**
 * @desc    Varyasyon stok güncelle
 * @route   PUT /api/products/:id/variants/:variantId/stock
 * @access  Private (Admin)
 */
export const updateVariantStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, variantId } = req.params;
    const { newStock, reason, notes } = req.body;
    const userId = req.user?.userId;

    if (typeof newStock !== 'number' || newStock < 0) {
      res.status(400).json({
        success: false,
        message: 'Geçerli bir stok miktarı girin'
      });
      return;
    }

    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
      return;
    }

    const variant = product.variants?.find(v => v._id?.toString() === variantId);
    if (!variant) {
      res.status(404).json({
        success: false,
        message: 'Varyasyon bulunamadı'
      });
      return;
    }

    const previousStock = variant.stock;
    const changeAmount = newStock - previousStock;

    const StockHistory = require('./stockHistoryModel').default;
    await StockHistory.create({
      product: id,
      variantId: variantId,
      previousStock,
      newStock,
      changeAmount,
      changeType: 'variant_manual',
      reason,
      performedBy: userId,
      notes
    });

    variant.stock = newStock;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Varyasyon stoku başarıyla güncellendi',
      data: {
        product,
        variant,
        stockChange: {
          previousStock,
          newStock,
          changeAmount
        }
      }
    });
  } catch (error) {
    console.error('Update variant stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Varyasyon stoku güncellenirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   post /api/products/test/variant-product
 * @access  
 */
export const createTestVariantProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const giyimCategory = await Category.findOne({ slug: 'giyim' });
    if (!giyimCategory) {
      res.status(404).json({
        success: false,
        message: 'Giyim kategorisi bulunamadı'
      });
      return;
    }

    const testProduct = new Product({
      name: 'T-Shirt',
      slug: 'tshirt',
      description: '%20 sentetik %80 pamuklu kumaştan yapılmış yazlık giyim için uygundur.',
      category: giyimCategory._id,
      price: 500,
      salePrice: 450,
      currency: 'TRY',
      sku: 'TSHIRT1',
      stock: 500,
      trackQuantity: true,
      lowStockThreshold: 5,
      images: [
        {
          url: '/uploads/products/product-1752862160305-928708826.jpg',
          alt: 'T-Shirt - Görsel 1',
          isPrimary: true,
          sortOrder: 0
        }
      ],
      variants: [
        {
          name: 'Kırmızı T-SHIRT',
          options: [
            {
              name: 'Renk',
              value: 'Kırmızı'
            }
          ],
          sku: 'TSHIRT1-KIRMIZI',
          price: 500,
          salePrice: 450,
          stock: 50,
          isDefault: true
        },
        {
          name: 'Mavi T-SHIRT',
          options: [
            {
              name: 'Renk',
              value: 'Mavi'
            }
          ],
          sku: 'TSHIRT1-MAVI',
          price: 500,
          salePrice: 450,
          stock: 30,
          isDefault: false
        },
        {
          name: 'Yeşil T-SHIRT',
          options: [
            {
              name: 'Renk',
              value: 'Yeşil'
            }
          ],
          sku: 'TSHIRT1-YESIL',
          price: 500,
          salePrice: 450,
          stock: 2, 
          isDefault: false
        },
        {
          name: 'Siyah T-SHIRT',
          options: [
            {
              name: 'Renk',
              value: 'Siyah'
            }
          ],
          sku: 'TSHIRT1-SIYAH',
          price: 500,
          salePrice: 450,
          stock: 0, 
          isDefault: false
        }
      ],
      tags: ['tshirt', 'giyim', 'yazlık'],
      status: 'active',
      isFeatured: false,
      averageRating: 0,
      reviewCount: 0
    });

    const savedProduct = await testProduct.save();
    await savedProduct.populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Test varyasyonlu ürün başarıyla oluşturuldu',
      data: savedProduct
    });
  } catch (error) {
    console.error('Create test variant product error:', error);
    res.status(500).json({
      success: false,
      message: 'Test ürünü oluşturulurken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
}; 

 