import { Save, Loader2 } from "lucide-react";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks";

const COUNTRIES = [
    { name: "Afganistán", code: "AF" },
    { name: "Albania", code: "AL" },
    { name: "Alemania", code: "DE" },
    { name: "Andorra", code: "AD" },
    { name: "Angola", code: "AO" },
    { name: "Argentina", code: "AR" },
    { name: "Australia", code: "AU" },
    { name: "Austria", code: "AT" },
    { name: "Bélgica", code: "BE" },
    { name: "Bolivia", code: "BO" },
    { name: "Brasil", code: "BR" },
    { name: "Canadá", code: "CA" },
    { name: "Chile", code: "CL" },
    { name: "China", code: "CN" },
    { name: "Colombia", code: "CO" },
    { name: "Costa Rica", code: "CR" },
    { name: "Cuba", code: "CU" },
    { name: "Ecuador", code: "EC" },
    { name: "El Salvador", code: "SV" },
    { name: "España", code: "ES" },
    { name: "Estados Unidos", code: "US" },
    { name: "Francia", code: "FR" },
    { name: "Guatemala", code: "GT" },
    { name: "Honduras", code: "HN" },
    { name: "Italia", code: "IT" },
    { name: "México", code: "MX" },
    { name: "Nicaragua", code: "NI" },
    { name: "Panamá", code: "PA" },
    { name: "Paraguay", code: "PY" },
    { name: "Perú", code: "PE" },
    { name: "Portugal", code: "PT" },
    { name: "Reino Unido", code: "GB" },
    { name: "República Dominicana", code: "DO" },
    { name: "Uruguay", code: "UY" },
    { name: "Venezuela", code: "VE" }
].sort((a, b) => a.name.localeCompare(b.name));

const Profile = () => {
    const { getCurrentUser, changeProfileInfo} = useAuth();
    const [loading, setLoading] = useState(false);

    const {
        register: rhfRegister,
        handleSubmit: rhfHandleSubmit,
        formState: { errors },
        reset
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            countryCode: '',
            birthDate: '',
            city: '',
            country: '',
            wallet: '',
        },
    });

    // Cargar datos del usuario al montar
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await getCurrentUser();
                if (user) {
                    reset({
                        name: user.firstname + " " + user.lastname || "",
                        email: user.email || "",
                        phone: user.phone || "",
                        countryCode: user.countryCode || "",
                        birthDate: user.birthdate ? user.birthdate.split("T")[0] : "",
                        city: user.city || "",
                        country: user.country || "",
                    });
                }
            } catch (error) {
                console.error("Error obteniendo usuario:", error);
            }
        };

        fetchUser();
    }, [reset]);

    const handleSubmit = (data: any) => {
        console.log("Datos a enviar:", data);
        try {

            data.firstname = data.name.split(' ')[0];
            data.lastname = data.name.split(' ')[1];

            const response = changeProfileInfo(data);
             if (window.toast && window.toast.success) {
                window.toast.success('Informacion del usuario modificada con éxito', { duration: 5000 });
            }
        } catch (error) {
            console.error("Error al cambiar información del perfil:", error);

        }
    };

    return (
        <div className="w-full h-screen bg-zinc-100 overflow-hidden">
            <div className="px-6 py-5 h-full overflow-y-auto">
                <div className="border-b border-zinc-200 pb-4 mb-8 flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                        <div className="text-indigo-950 text-3xl font-bold font-['Open_Sans']">Perfil del usuario</div>
                    </div>
                </div>
                <div className="max-w-[904px] mx-auto bg-white rounded-lg shadow p-4 md:p-8">
                    <form onSubmit={rhfHandleSubmit(handleSubmit)} className="max-w-xl mx-auto space-y-4">
                        {/* Nombre */}
                        <div className="space-y-2">
                            <label className="text-zinc-800 text-sm font-medium">Nombre</label>
                            <input
                                type="text"
                                {...rhfRegister('name', { required: 'El nombre es obligatorio' })}
                                className="w-full pl-5 pr-4 py-2 bg-white rounded-md border border-neutral-400 focus:ring-2 focus:ring-blue-400"
                            />
                            {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-zinc-800 text-sm font-medium">Correo electrónico</label>
                            <input
                                type="email"
                                {...rhfRegister('email', {
                                    required: 'El correo electrónico es obligatorio',
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: 'Correo electrónico inválido',
                                    }
                                })}
                                className="w-full pl-5 pr-4 py-2 bg-white rounded-md border border-neutral-400 focus:ring-2 focus:ring-blue-400"
                            />
                            {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
                        </div>

                        {/* Teléfono */}
                        <div className="space-y-2">
                            <label className="text-zinc-800 text-sm font-medium">Teléfono</label>
                            <input
                                type="tel"
                                {...rhfRegister("phone")}
                                className="w-full pl-5 pr-4 py-2 bg-white rounded-md border border-neutral-400 focus:ring-2 focus:ring-blue-400"
                            />
                        </div>

                        {/* Fecha de nacimiento */}
                        <div className="space-y-2">
                            <label className="text-zinc-800 text-sm font-medium">Fecha de nacimiento</label>
                            <input
                                type="date"
                                {...rhfRegister("birthDate")}
                                className="w-full pl-5 pr-4 py-2 bg-white rounded-md border border-neutral-400 focus:ring-2 focus:ring-blue-400"
                            />
                        </div>

                        {/* País */}
                        <div className="space-y-2">
                            <label className="text-zinc-800 text-sm font-medium">País</label>
                            <select
                                {...rhfRegister("country")}
                                className="w-full pl-5 pr-4 py-2 bg-white rounded-md border border-neutral-400 focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="">Selecciona un país</option>
                                {COUNTRIES.map((country) => (
                                    <option key={country.code} value={country.code}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Ciudad */}
                        <div className="space-y-2">
                            <label className="text-zinc-800 text-sm font-medium">Ciudad</label>
                            <input
                                type="text"
                                {...rhfRegister("city")}
                                className="w-full pl-5 pr-4 py-2 bg-white rounded-md border border-neutral-400 focus:ring-2 focus:ring-blue-400"
                            />
                        </div>

                        <div className="flex items-center justify-center">
                            <button
                                type="submit"
                                className="w-full cursor-pointer md:w-96 px-4 md:px-7 py-3 bg-blue-600 rounded-md inline-flex justify-center items-center gap-2.5 hover:bg-blue-700 transition-colors"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="animate-spin h-5 w-5 text-white" />
                                        <span className="text-white text-base font-bold">Cargando...</span>
                                    </div>
                                ) : (
                                    <span className="text-white text-base font-bold flex items-center gap-2">
                                        <Save className="w-4 h-4" />
                                        Guardar
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;