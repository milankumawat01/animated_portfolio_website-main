import { motion } from 'framer-motion'
import { blogs } from '../data/content'

export default function Blogs() {
  return (
    <section id="blogs" className="h-screen snap-start bg-white overflow-y-auto">
      <div className="min-h-full px-6 sm:px-10 md:px-14 lg:px-20 xl:px-28 2xl:px-36 py-10 sm:py-14 flex flex-col justify-center max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-10"
        >
          <p className="italic text-sm 2xl:text-base mb-2">Blog</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl font-black text-black">READ MY BLOG</h1>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 mb-6 sm:mb-10">
          {blogs.map((blog, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.4 }}
              className="cursor-pointer group"
            >
              <div className="overflow-hidden rounded-lg mb-3 sm:mb-4">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-36 sm:h-44 md:h-48 lg:h-52 2xl:h-60 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="gradient-text text-xs sm:text-sm 2xl:text-base font-medium mb-1 sm:mb-2">{blog.date}</p>
              <h3 className="text-sm sm:text-base lg:text-lg 2xl:text-xl font-bold text-black group-hover:text-gray-600 transition-colors">
                {blog.title}
              </h3>
              <div className="mt-3 sm:mt-4 border-b border-gray-200" />
            </motion.article>
          ))}
        </div>

        <div className="flex justify-center">
          <button className="bg-dark-deep text-white px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm 2xl:text-base font-semibold hover:bg-black transition-colors flex items-center gap-2 rounded">
            Load more <span>↗️</span>
          </button>
        </div>
      </div>
    </section>
  )
}
