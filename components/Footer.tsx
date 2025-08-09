export default function Footer() {
    return (
        <footer className='bg-base-200 py-6 mt-10'>
            <div className='container mx-auto px-4 text-center'>
                <p className='text-sm text-gray-600'>
                    &copy; {new Date().getFullYear()} Kicka. All rights reserved.
                </p>
            </div>
        </footer>
    );
}