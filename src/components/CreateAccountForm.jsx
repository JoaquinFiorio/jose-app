import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function CreateAccountForm({
                                              referrer ,
                                              form,
                                              setForm,
                                              onSubmit,
                                              error = "",    // <-- agrégalo aquí
                                              loading = false,
                                          }) {

    const [searchParams] = useSearchParams();
    referrer = searchParams.get("referral") || "Matías";
    const [errors, setErrors] = useState({});

    // Regex
    const regex = {
        name: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/,
        lastName: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/,
        username: /^[A-Za-z][A-Za-z0-9_]{3,19}$/, // 4-20, inicia con letra
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
        countryCode: /^\+\d{1,4}$/,
        phoneNumber: /^\d{6,15}$/
    };

    // Validación individual
    const validateField = (name, value) => {
        switch (name) {
            case "name":
                if (!value) return "Nombre requerido";
                if (!regex.name.test(value)) return "Solo letras, mínimo 2 caracteres";
                break;
            case "lastName":
                if (!value) return "Apellido requerido";
                if (!regex.lastName.test(value)) return "Solo letras, mínimo 2 caracteres";
                break;
            case "username":
                if (!value) return "Usuario requerido";
                if (!regex.username.test(value)) return "4-20 caracteres, solo letras, números o _ y empezar con letra";
                break;
            case "email":
                if (!value) return "Correo requerido";
                if (!regex.email.test(value)) return "Correo inválido";
                break;
            case "password":
                if (!value) return "Contraseña requerida";
                if (!regex.password.test(value)) return "Mín. 8 caracteres, mayúscula, minúscula, número y símbolo";
                break;
            case "confirmPassword":
                if (!value) return "Confirma tu contraseña";
                if (value !== form.password) return "Las contraseñas no coinciden";
                break;
            case "countryCode":
                if (!value) return "Código de país requerido";
                if (!regex.countryCode.test(value)) return "Formato inválido (ej: +34)";
                break;
            case "phoneNumber":
                if (!value) return "Número de teléfono requerido";
                if (!regex.phoneNumber.test(value)) return "Número de teléfono inválido";
                break;
            case "terms":
                if (!form.terms) return "Debes aceptar los términos";
                break;
            default:
                break;
        }
        return "";
    };

    // Validación completa
    const validateAll = () => {
        const newErrors = {};
        Object.keys(form).forEach((key) => {
            if (key !== "terms") {
                const err = validateField(key, form[key]);
                if (err) newErrors[key] = err;
            }
        });
        if (!form.terms) newErrors.terms = "Debes aceptar los términos";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // OnChange
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        // Validación instantánea por campo
        setErrors((prev) => ({
            ...prev,
            [name]: validateField(name, type === "checkbox" ? checked : value),
        }));
    };

    // Submit
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateAll()) {
            onSubmit(e);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto bg-white rounded-3xl p-10 flex flex-col items-center">
            {/* Título */}
            <h2 className="text-center text-2xl font-semibold mb-7">
                Tu has sido referido por <b>{referrer}</b>.
            </h2>
            {/* Formulario */}
            <form className="w-full" onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                    <label className="block text-base font-semibold mb-1">Nombre</label>
                    <input
                        className={`w-full px-4 py-2 border rounded text-base focus:outline-none ${errors.name ? "border-red-400" : "border-gray-300 focus:border-[#276ef1]"}`}
                        name="name"
                        placeholder="Ingresa tu nombre"
                        value={form.name}
                        onChange={handleChange}
                        autoComplete="off"
                    />
                    {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
                </div>
                <div className="mb-4">
                    <label className="block text-base font-semibold mb-1">Apellido</label>
                    <input
                        className={`w-full px-4 py-2 border rounded text-base focus:outline-none ${errors.lastName ? "border-red-400" : "border-gray-300 focus:border-[#276ef1]"}`}
                        name="lastName"
                        placeholder="Ingresa tu apellido"
                        value={form.lastName}
                        onChange={handleChange}
                        autoComplete="off"
                    />
                    {errors.lastName && <span className="text-red-500 text-xs">{errors.lastName}</span>}
                </div>
                <div className="mb-4">
                    <label className="block text-base font-semibold mb-1">Usuario</label>
                    <input
                        className={`w-full px-4 py-2 border rounded text-base focus:outline-none ${errors.username ? "border-red-400" : "border-gray-300 focus:border-[#276ef1]"}`}
                        name="username"
                        placeholder="Ingresa tu usuario"
                        value={form.username}
                        onChange={handleChange}
                        autoComplete="off"
                    />
                    {errors.username && <span className="text-red-500 text-xs">{errors.username}</span>}
                </div>
                <div className="mb-4">
                    <label className="block text-base font-semibold mb-1">Correo electrónico</label>
                    <input
                        type="email"
                        className={`w-full px-4 py-2 border rounded text-base focus:outline-none ${errors.email ? "border-red-400" : "border-gray-300 focus:border-[#276ef1]"}`}
                        name="email"
                        placeholder="Ingresa tu correo electrónico"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="off"
                    />
                    {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-base font-semibold mb-1">Código de país</label>
                        <input
                            className={`w-full px-4 py-2 border rounded text-base focus:outline-none ${errors.countryCode ? "border-red-400" : "border-gray-300 focus:border-[#276ef1]"}`}
                            name="countryCode"
                            placeholder="+34"
                            value={form.countryCode}
                            onChange={handleChange}
                            autoComplete="off"
                        />
                        {errors.countryCode && <span className="text-red-500 text-xs">{errors.countryCode}</span>}
                    </div>
                    <div>
                        <label className="block text-base font-semibold mb-1">Número de teléfono</label>
                        <input
                            className={`w-full px-4 py-2 border rounded text-base focus:outline-none ${errors.phoneNumber ? "border-red-400" : "border-gray-300 focus:border-[#276ef1]"}`}
                            name="phoneNumber"
                            placeholder="123456789"
                            value={form.phoneNumber}
                            onChange={handleChange}
                            autoComplete="off"
                        />
                        {errors.phoneNumber && <span className="text-red-500 text-xs">{errors.phoneNumber}</span>}
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-base font-semibold mb-1">Contraseña</label>
                    <input
                        type="password"
                        className={`w-full px-4 py-2 border rounded text-base focus:outline-none ${errors.password ? "border-red-400" : "border-gray-300 focus:border-[#276ef1]"}`}
                        name="password"
                        placeholder="Ingresa tu contraseña"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                    />
                    {errors.password && <span className="text-red-500 text-xs">{errors.password}</span>}
                </div>
                <div className="mb-4">
                    <label className="block text-base font-semibold mb-1">Confirmar contraseña</label>
                    <input
                        type="password"
                        className={`w-full px-4 py-2 border rounded text-base focus:outline-none ${errors.confirmPassword ? "border-red-400" : "border-gray-300 focus:border-[#276ef1]"}`}
                        name="confirmPassword"
                        placeholder="Confirmar contraseña"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                    />
                    {errors.confirmPassword && <span className="text-red-500 text-xs">{errors.confirmPassword}</span>}
                </div>
                <div className="mb-6 flex items-center">
                    <input
                        type="checkbox"
                        name="terms"
                        checked={form.terms}
                        onChange={handleChange}
                        className={`mr-2 ${errors.terms ? "ring-2 ring-red-500" : ""}`}
                    />
                    <label className="text-base">
                        Acepto los <a href="#" className="underline font-semibold">términos y condiciones de uso</a>
                    </label>
                </div>
                {errors.terms && <div className="mb-4 text-red-500 text-xs text-center">{errors.terms}</div>}
                {error && (
                    <div className="mb-4 text-red-500 text-sm text-center">{error}</div>
                )}
                <button
                    type="submit"
                    className="w-full bg-[#276ef1] hover:bg-[#1d4ed8] text-white font-bold text-lg py-3 rounded-md transition mb-2"
                    disabled={loading}
                >
                    {loading ? "Creando cuenta..." : "Crear cuenta"}
                </button>
            </form>
            <div className="mt-2 text-center">
                <a href="#" className="underline font-medium text-black hover:text-[#276ef1]">
                    ¿Ya tienes una cuenta? Inicia sesión
                </a>
            </div>
        </div>
    );
}
