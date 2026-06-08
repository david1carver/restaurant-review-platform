// frontend/src/pages/admin/AdminRestaurantForm.jsx
// Screen 5b - Admin Create / Edit Restaurant.
//
// Create mode (default):  /admin/restaurants/new
//   POST /api/restaurants with { name, cuisine, location, description, imageUrl }
//
// Edit mode:              /admin/restaurants/:slug/edit
//   GET   /api/restaurants/:slug to pre-populate
//   PATCH /api/restaurants/:id with the changed fields
//
// Required fields: name, cuisine, location (slug auto-generates from name on the backend).
// Maps to SysML R020 (Create Restaurant) and R021 (Update Restaurant).

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import AdminNavbar from '../../components/mesa/AdminNavbar';
import Footer from '../../components/mesa/Footer';

export default function AdminRestaurantForm() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!slug;

  const [id, setId] = useState(null);
  const [name, setName] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEditMode) return;
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosInstance.get(`/api/restaurants/${slug}`);
        if (cancelled) return;
        const r = res.data;
        setId(r._id);
        setName(r.name || '');
        setCuisine(r.cuisine || '');
        setLocation(r.location || '');
        setDescription(r.description || '');
        setImageUrl(r.imageUrl || '');
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message || 'Failed to load restaurant');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [slug, isEditMode]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim() || !cuisine.trim() || !location.trim()) {
      setError('Name, cuisine, and location are required.');
      return;
    }

    const payload = {
      name: name.trim(),
      cuisine: cuisine.trim(),
      location: location.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
    };

    try {
      setSubmitting(true);
      setError(null);
      if (isEditMode) {
        await axiosInstance.patch(`/api/restaurants/${id}`, payload);
      } else {
        await axiosInstance.post('/api/restaurants', payload);
      }
      navigate('/admin/restaurants');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save restaurant');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AdminNavbar activeLink="restaurants" />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminNavbar activeLink="restaurants" />

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-8">
        <Link
          to="/admin/restaurants"
          className="inline-block text-muted-foreground hover:text-primary mb-4 text-sm"
        >
          &larr; Back to Restaurants
        </Link>

        <div className="bg-card border border-border rounded-lg p-6">
          <h1 className="text-3xl font-bold text-foreground mb-1">
            {isEditMode ? 'Edit Restaurant' : 'Add New Restaurant'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {isEditMode
              ? 'Update the catalogue entry. The slug regenerates from the name.'
              : 'Add a new restaurant to the catalogue. Name, cuisine, and location are required.'}
          </p>

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive rounded-md p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                Name <span className="text-destructive">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Canberra Crust"
                className="w-full border border-border rounded-md p-3 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="cuisine" className="block text-sm font-semibold text-foreground mb-2">
                Cuisine <span className="text-destructive">*</span>
              </label>
              <input
                id="cuisine"
                type="text"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                placeholder="e.g. Wood-fired Pizza"
                className="w-full border border-border rounded-md p-3 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-foreground mb-2">
                Location <span className="text-destructive">*</span>
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Canberra, ACT"
                className="w-full border border-border rounded-md p-3 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-foreground mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="A short description of the restaurant."
                className="w-full border border-border rounded-md p-3 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-semibold text-foreground mb-2">
                Image URL
              </label>
              <input
                id="imageUrl"
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full border border-border rounded-md p-3 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={submitting}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {submitting
                  ? (isEditMode ? 'Saving...' : 'Creating...')
                  : (isEditMode ? 'Save Changes' : 'Create Restaurant')}
              </button>
              <Link
                to="/admin/restaurants"
                className="px-5 py-2 border border-border text-foreground rounded-md hover:bg-muted transition"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
