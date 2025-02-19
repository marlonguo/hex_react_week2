import { useState, useEffect } from "react";

import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  const [account, setAccount] = useState({
    username: "",
    password: "",
  });

  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState(null);

  const token = document.cookie.replace(
    /(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/,
    "$1"
  );

  function handleChange(e) {
    const { name, value } = e.target;
    setAccount((account) => {
      return { ...account, [name]: value };
    });
  }

  async function getProducts() {
    try {
      const res = await axios.get(
        `${BASE_URL}/v2/api/${API_PATH}/admin/products`
      );

      return res.data;
    } catch (error) {
      alert("取得產品資料失敗");
    }
  }

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const res = await axios.post(`${BASE_URL}/v2/admin/signin`, account);
      const { token, expired } = res.data;
      document.cookie = `hexToken=${token}; expires=${new Date(expired)}`;

      axios.defaults.headers.common["Authorization"] = token;
      const { products } = await getProducts();

      setProducts(products);

      setIsAuth(true);
    } catch (error) {
      alert("登入失敗");
    }
  }

  async function checkUserLogin() {
    axios.defaults.headers.common["Authorization"] = token;
    try {
      const res = await axios.post(`${BASE_URL}/v2/api/user/check`);
      return res.data;
    } catch (error) {
      alert("確認登入發生錯誤");
    }
  }

  async function handleCheckLogin() {
    const res = await checkUserLogin();
    res?.success ? alert("使用者已登入") : alert("未登入");
  }

  // 如果已經登入過並記錄過 token, 將 isAuth 設為 true, 渲染產品列表
  useEffect(() => {
    (async function () {
      if (token) {
        const res = await checkUserLogin();
        if (res.success) {
          const { products } = await getProducts();
          setProducts(products);

          setIsAuth(true);
        }
      }
    })();
  }, []);

  return (
    <>
      {isAuth ? (
        <div className="container">
          <div className="row">
            <div className="col-6">
              <button
                onClick={handleCheckLogin}
                type="button"
                className="btn btn-success mb-3"
              >
                檢查使用者是否登入
              </button>
              <h2>產品列表</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">產品名稱</th>
                    <th scope="col">原價</th>
                    <th scope="col">售價</th>
                    <th scope="col">是否啟用</th>
                    <th scope="col">查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.title}</td>
                      <td>{product.origin_price}</td>
                      <td>{product.price}</td>
                      <td>{product.is_enabled > 0 ? "是" : "否"}</td>
                      <td>
                        <button
                          className="btn btn-primary"
                          onClick={() => setTempProduct(product)}
                        >
                          查看細節
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="col-6">
              <h2>單一產品細節</h2>
              {tempProduct ? (
                <div className="card">
                  <img
                    src={tempProduct.imageUrl}
                    className="card-img-top"
                    alt={tempProduct.title}
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {tempProduct.title}
                      <span className="badge bg-primary ms-2">
                        {tempProduct.category}
                      </span>
                    </h5>

                    <p className="card-text">
                      商品描述 : {tempProduct.description}
                    </p>
                    <p className="card-text">
                      商品內容 : {tempProduct.content}
                    </p>
                    <p className="card-text">
                      <del>{tempProduct.origin_price}</del> /{" "}
                      {tempProduct.price}
                    </p>
                    <h5>更多圖片：</h5>
                    <div className="d-flex flex-wrap">
                      {tempProduct.imagesUrl.map((url, index) =>
                        url ? (
                          <img key={index} src={url} alt={tempProduct.title} />
                        ) : (
                          ""
                        )
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p>請選擇一個商品查看</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ height: "100vh" }}
        >
          <h3>請先登入</h3>
          <form onSubmit={handleLogin} className="d-flex flex-column">
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="email"
                placeholder="帳號"
                name="username"
                value={account.username}
                onChange={handleChange}
              />
              <label htmlFor="email">帳號</label>
            </div>
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="password"
                placeholder="password"
                name="password"
                value={account.password}
                onChange={handleChange}
              />
              <label htmlFor="password">密碼</label>
            </div>
            <button className="btn btn-primary">登入</button>
          </form>
          <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
        </div>
      )}
    </>
  );
}

export default App;
