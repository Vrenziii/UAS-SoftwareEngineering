# Car Wash Management System

Aplikasi web *full-stack* berbasis peran (Role-Based Access Control) untuk manajemen layanan cuci mobil. Dilengkapi dengan tiga portal pengguna (Customer, Worker, Admin), integrasi *payment gateway*, dan analitik *dashboard*.

## 🚀 Fitur Utama
* **Multi-Role Dashboard:** Akses spesifik untuk Admin, Worker, dan Customer.
* **In-App Payments:** Integrasi Midtrans Snap API untuk *checkout* dan *webhook settlement*.
* **Photo Evidence System:** Pekerja wajib mengunggah foto "Sebelum" dan "Sesudah" (menggunakan Multer) untuk menyelesaikan tugas.
* **Data Visualization:** Admin *control panel* dengan grafik interaktif (Recharts) untuk pendapatan dan status operasional.
* **Modern UI:** Dibangun dengan Tailwind CSS menggunakan tema *dark-mode glassmorphism*.

## 🛠️ Tech Stack
* **Frontend:** Next.js (React), Tailwind CSS, Recharts, Axios
* **Backend:** Node.js, Express.js, MySQL (Laragon), JWT, Multer
* **Third-Party:** Midtrans Payment Gateway