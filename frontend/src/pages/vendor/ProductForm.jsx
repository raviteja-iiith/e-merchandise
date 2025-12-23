import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX, FiUpload, FiTrash2, FiPlus } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ProductForm = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const isEditMode = Boolean(productId);
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    category: '',
    basePrice: '',
    salePrice: '',
    sku: '',
    stock: '',
    images: [],
    specifications: {},
    variants: [],
    tags: [],
    isActive: true,
  });

  const [variants, setVariants] = useState([]);
  const [newVariant, setNewVariant] = useState({ name: '', price: '', stock: '' });
  const [specifications, setSpecifications] = useState([{ key: '', value: '' }]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchProduct();
    }
  }, [productId]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${productId}`);
      console.log('Product data received:', data);
      
      const product = data.data?.product || data.data;
      if (!product) {
        throw new Error('Product data not found in response');
      }
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        category: product.category?._id || product.category || '',
        basePrice: product.basePrice || '',
        salePrice: product.salePrice || '',
        sku: product.sku || '',
        stock: product.stock || 0,
        images: product.images || [],
        specifications: product.specifications || {},
        variants: product.variants || [],
        tags: product.tags || [],
        isActive: product.isActive !== undefined ? product.isActive : true,
      });
      setVariants(product.variants || []);
      setSpecifications(
        Object.entries(product.specifications || {}).map(([key, value]) => ({ key, value }))
      );
    } catch (error) {
      console.error('Failed to load product:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to load product');
      navigate('/vendor/products');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Convert images to base64 or use placeholder URLs
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
    
    toast.success(`${files.length} image(s) added`);
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const addVariant = () => {
    if (newVariant.name && newVariant.price && newVariant.stock) {
      setVariants([...variants, { ...newVariant }]);
      setNewVariant({ name: '', price: '', stock: '' });
    }
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const updateSpecification = (index, field, value) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const removeSpecification = (index) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert specifications array to object
      const specsObj = {};
      specifications.forEach(({ key, value }) => {
        if (key && value) specsObj[key] = value;
      });

      const payload = {
        ...formData,
        specifications: specsObj,
        variants,
      };

      if (isEditMode) {
        await api.put(`/products/${productId}`, payload);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', payload);
        toast.success('Product created successfully');
      }
      navigate('/vendor/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Short Description *</label>
        <input
          type="text"
          name="shortDescription"
          value={formData.shortDescription}
          onChange={handleChange}
          maxLength={200}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
        <p className="text-sm text-gray-500 mt-1">{formData.shortDescription.length}/200 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Add a tag and press Enter"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button type="button" onClick={addTag} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag, index) => (
            <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center gap-2">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-indigo-900">
                <FiX size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Pricing & Inventory</h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Base Price *</label>
          <input
            type="number"
            name="basePrice"
            value={formData.basePrice}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price</label>
          <input
            type="number"
            name="salePrice"
            value={formData.salePrice}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-gray-700">Make product active</span>
        </label>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Images & Variants</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <FiUpload className="text-4xl text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer text-indigo-600 hover:text-indigo-800">
            Browse files
          </label>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4">
          {formData.images.map((img, index) => (
            <div key={index} className="relative group">
              <img src={img} alt={`Product ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Variants</label>
        <div className="space-y-2 mb-4">
          {variants.map((variant, index) => (
            <div key={index} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg">
              <div className="flex-1 grid grid-cols-3 gap-2">
                <span className="text-sm"><strong>Name:</strong> {variant.name}</span>
                <span className="text-sm"><strong>Price:</strong> ${variant.price}</span>
                <span className="text-sm"><strong>Stock:</strong> {variant.stock}</span>
              </div>
              <button type="button" onClick={() => removeVariant(index)} className="text-red-600 hover:text-red-800">
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Variant name (e.g., Size M)"
            value={newVariant.name}
            onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="number"
            placeholder="Price"
            value={newVariant.price}
            onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
            className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="number"
            placeholder="Stock"
            value={newVariant.stock}
            onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
            className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <button type="button" onClick={addVariant} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <FiPlus />
          </button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Specifications</label>
          <button type="button" onClick={addSpecification} className="text-indigo-600 hover:text-indigo-800 text-sm">
            + Add Specification
          </button>
        </div>
        <div className="space-y-2">
          {specifications.map((spec, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                placeholder="Key (e.g., Material)"
                value={spec.key}
                onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Value (e.g., Cotton)"
                value={spec.value}
                onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <button type="button" onClick={() => removeSpecification(index)} className="text-red-600 hover:text-red-800">
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-gray-600 mt-1">Fill in the product details</p>
        </div>
        <button
          onClick={() => navigate('/vendor/products')}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="flex mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1 flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= s ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {s}
            </div>
            {s < 3 && <div className={`flex-1 h-1 ${step > s ? 'bg-indigo-600' : 'bg-gray-300'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        <div className="flex justify-between">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="ml-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="ml-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:bg-gray-400"
            >
              <FiSave /> {loading ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
