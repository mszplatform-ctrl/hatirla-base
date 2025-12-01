import { useEffect, useState } from "react";

export default function AdminPage() {
  const [data, setData] = useState({ users: [], packages: [], suggestions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/api/admin/overview")
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-6 text-center">Yükleniyor...</div>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Admin Panel</h1>

      <div>
        <h2 className="text-xl font-semibold mb-2">Kullanıcılar</h2>
        <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border-b">ID</th>
              <th className="p-2 border-b">Name</th>
              <th className="p-2 border-b">Email</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-2 border-b">{user.id}</td>
                <td className="p-2 border-b">{user.name}</td>
                <td className="p-2 border-b">{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Paketler</h2>
        <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border-b">ID</th>
              <th className="p-2 border-b">Title</th>
              <th className="p-2 border-b">Price</th>
              <th className="p-2 border-b">User ID</th>
            </tr>
          </thead>
          <tbody>
            {data.packages.map(pkg => (
              <tr key={pkg.id} className="hover:bg-gray-50">
                <td className="p-2 border-b">{pkg.id}</td>
                <td className="p-2 border-b">{pkg.title}</td>
                <td className="p-2 border-b">${pkg.price}</td>
                <td className="p-2 border-b">{pkg.userId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">AI Öneriler</h2>
        <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border-b">ID</th>
              <th className="p-2 border-b">Text</th>
              <th className="p-2 border-b">AI Score</th>
            </tr>
          </thead>
          <tbody>
            {data.suggestions.map(sug => (
              <tr key={sug.id} className="hover:bg-gray-50">
                <td className="p-2 border-b">{sug.id}</td>
                <td className="p-2 border-b">{sug.text}</td>
                <td className="p-2 border-b">{sug.aiScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
