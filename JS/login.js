function logIn1() {
  const loginSection = document.getElementById("logInA");
  if (loginSection) {
    if (loginSection.style.display === "inline") {
      // Đang mở -> tắt form và cho phép cuộn trang lại
      loginSection.style.display = "none";
      document.body.style.overflow = "";
    } else {
      // Đang tắt -> mở form và khóa cuộn trang và mờ background
      loginSection.style.display = "inline";
      document.body.style.overflow = "hidden";
    }
  } else {
    console.error("Không tìm thấy class .logIn trong HTML");
  }
}
// Lưu trạng thái đăng nhập vào localStorage
async function getUser() {
  const usernameVal = document.getElementById("username").value;
  const passwordVal = document.getElementById("password").value;
  const rememberMe = document.getElementById("rememberMe").checked;

  // Khai báo các biến giao diện ngay trong hàm để tránh lỗi "not defined"
  const signUpForm = document.getElementById("logInA"); // Form đăng nhập
  const loginBtnHeader = document.getElementById("loginbtn"); // Nút trên Header

  try {
    const response = await fetch("../Json/user.json");
    if (!response.ok) return;
    const users = await response.json();

    const userFound = users.find(
      (u) => u.username === usernameVal && u.password === passwordVal,
    );

    if (userFound) {
      // 1. Lưu vào máy
      localStorage.setItem("username", userFound.username);
      localStorage.setItem("fullname", userFound.fullname);
      localStorage.setItem("avatar", userFound.avatar);

      alert("Đăng nhập thành công!");

      // 2. Tắt Form Login (Sửa lỗi không tắt được)
      if (signUpForm) {
        // Vì class cha là .logIn bao quanh form, bạn nên ẩn class cha nếu cần
        signUpForm.parentElement.style.display = "none";
      }
      // 3. Cho phép scroll lại trang
      enableScroll();

      // 3. Đổi giao diện nút Header
      changeImage();
    } else {
      alert("Sai thông tin đăng nhập");
    }
  } catch (error) {
    console.error("Lỗi:", error);
  }
}
//Ghi nhớ đăng nhập nếu chọn "Remember Me"
function rememberLogin() {
  const rememberMe = document.getElementById("rememberMe").checked;
  if (rememberMe) {
    // Nếu chọn "Remember Me", lưu thông tin đăng nhập vào localStorage
    localStorage.setItem("rememberMe", "true");
  } else {
    // Nếu không chọn, xóa thông tin đăng nhập khỏi localStorage
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("username");
    localStorage.removeItem("fullname");
    localStorage.removeItem("avatar");
  }
}
// Hàm đổi Avatar (Tách riêng để dùng cho window.onload)
function changeImage() {
  const fullname = localStorage.getItem("fullname");
  const avatar = localStorage.getItem("avatar");
  const signin = document.getElementById("loginbtn");

  if (fullname && avatar && signin) {
    signin.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <img src="${avatar}" alt="Avatar" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;">
        <span>${fullname}</span>
      </div>
    `;
  }
}
// Phần Sản phẩm
// Gán hình ảnh và thông tin sản phẩm  từ product.json vào trang chủ
async function loadProducts() {
  try {
    const response = await fetch("../Json/product.json");
    if (!response.ok) {
      throw new Error("Lỗi khi tải dữ liệu sản phẩm");
    }
    const products = await response.json();
    const productContainer = document.getElementById("product-container");
    if (productContainer) {
      products.forEach((product) => {
        product.variants.forEach((variant) => {
          const productElement = document.createElement("div");
          productElement.classList.add("product-card");
          productElement.innerHTML = `
            <img class="product-image" src="${variant.image}" alt="${product.name}"> 
            <h3 class="product-name">${product.name}</h3> 
            <span class="product-sku">${variant.weight}<span>
            <p class="product-price">Giá: ${variant.price.toLocaleString()} VND</p>
            <button   data-sku="${variant.sku}" type="button" class="btn-add-cart">Thêm vào giỏ</button>
        `;
          productContainer.appendChild(productElement);
        });
      });
    } else {
      console.error("Không tìm thấy phần tử #product-container trong HTML");
    }
  } catch (error) {
    console.error("Lỗi:", error);
  }
}
// Thêm sản phẩm vào giỏ hàng
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("btn-add-cart")) {
    const productCard = event.target.closest(".product-card");
    const productName = productCard.querySelector(".product-name").textContent;
    const productPrice =
      productCard.querySelector(".product-price").textContent;
    // Lấy SKU từ button
    const productSku = event.target.dataset.sku;
    const cartCount = document.getElementById("cartcount");
    let count = parseInt(cartCount.textContent) || 0;
    cartCount.textContent = count + 1;
    const cartTable = document.getElementById("cart-items");
    if (cartTable) {
      const newRow = cartTable.insertRow(-1);
      const cell1 = newRow.insertCell(0);
      const cell2 = newRow.insertCell(1);
      const cell3 = newRow.insertCell(2);
      const cell4 = newRow.insertCell(3);
      const cell5 = newRow.insertCell(4);
      // STT
      cell1.textContent = cartTable.rows.length;
      // Mã sản phẩm
      cell2.textContent = productSku;
      // Tên sản phẩm
      cell3.textContent = productName;
      // Số lượng
      cell4.textContent = 1;
      // Tổng tiền
      cell5.textContent = productPrice.replace("Giá: ", "");
    }
    // tính tổng tiền
    const totalPrice = Array.from(cartTable.rows)

      .reduce((total, row) => {
        const priceText = row.cells[4].textContent.replace(/[^0-9]/g, "");

        return total + parseInt(priceText || 0);
      }, 0);

    document.getElementById("cart-total").textContent =
      totalPrice.toLocaleString("vi-VN") + "đ";
  }
});
// nhấn vào showCart() chuyển style của giỏ hàng
function showCart() {
  const cart = document.getElementById("carttable");
  if (cart) {
    cart.style.display = cart.style.display === "block" ? "none" : "block";
  }
}
// QUAN TRỌNG: Giữ trạng thái khi load lại trang
window.onload = function () {
  changeImage();
  loadProducts();
  fillLoginForm();
};
