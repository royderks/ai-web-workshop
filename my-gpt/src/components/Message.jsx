export default function Message({ role, content }) {

    return (
        <div className="flex items-start gap-2.5 mx-8 mb-4">
            <div className="z-10 w-8 h-8 rounded-full bg-red-300">
                <span className="w-8 h-8 flex justify-center items-center">{role}</span>
            </div>
            <div className="flex flex-col w-full leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                <p className="text-sm font-normal py-2.5 text-gray-900 dark:text-white">{content}</p>
            </div>
        </div>
    );
}