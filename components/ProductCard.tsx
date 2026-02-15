interface Product {
  id: string;
  title: string;
  price: number;
  image_url: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
  onBuy: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onBuy, onAddToCart }: ProductCardProps) {
  // Use local proxy to guarantee image loading (bypasses CORS/referrer/mixed-content issues)
  const imageUrl = product.image_url
    ? `https://acp-bice.vercel.app/api/image?url=${encodeURIComponent(product.image_url)}`
    : '';

  return (
    <div className="bg-[#2a2a2a] rounded-xl overflow-hidden border border-white/5 hover:border-white/15 transition-all hover:scale-[1.02] group cursor-pointer">
      {/* Image */}
      <div className="relative h-72 w-full bg-[#1a1a1a] overflow-hidden flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'flex flex-col items-center justify-center h-full text-gray-500';
                fallback.innerHTML = `<svg class="w-10 h-10 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg><span class="text-[10px]">${product.category}</span>`;
                parent.appendChild(fallback);
              }
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg className="w-10 h-10 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px]">No image</span>
          </div>
        )}
        {/* Category badge */}
        <span className="absolute top-3 left-3 text-sm font-medium text-gray-300 bg-black/60 backdrop-blur-sm px-3.5 py-1.5 rounded-full capitalize">
          {product.category}
        </span>
      </div>

      {/* Info */}
      <div className="p-6">
        <h3 className="text-base font-semibold text-white line-clamp-2 mb-4 leading-snug min-h-[44px]" title={product.title}>
          {product.title}
        </h3>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-white">₹{product.price.toLocaleString()}</span>
          <div className="flex gap-1.5">
            {onAddToCart && (
              <button
                onClick={() => onAddToCart(product)}
                className="bg-transparent text-white text-base font-semibold px-4 py-3 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
                title="Add to Cart"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              </button>
            )}
            <button
              onClick={() => onBuy(product)}
              className="bg-white text-black text-base font-semibold px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
