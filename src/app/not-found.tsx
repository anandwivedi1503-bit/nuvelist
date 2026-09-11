export default function NotFound() {
  return (
    <div className="container-nvl py-24 text-center">
      <h1 className="serif text-5xl">Page not found</h1>
      <p className="mt-3 text-muted">This ritual does not exist. Return to the shop.</p>
      <a href="/shop" className="btn btn-primary mt-8">
        Shop
      </a>
    </div>
  );
}
