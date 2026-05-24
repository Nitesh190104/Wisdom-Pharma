import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { contactService } from '../services';

export default function Contact() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await contactService.sendMessage(data);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      reset();
    } catch (err) {
      const apiMessage = err?.response?.data?.message;
      toast.error(apiMessage || 'Failed to send message. Please try again.');
    }
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Contact Us</h1>
            <p className="text-primary-100 max-w-xl mx-auto">Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              {[
                { icon: HiOutlineLocationMarker, title: 'Visit Us', lines: ['Meera Nagar, Kandawa, Kanchanpur, Chitayipur', 'Varanasi, Uttar Pradesh - 221008'] },
                { icon: HiOutlinePhone, title: 'Call Us', lines: ['+91 76520 45125', 'Support: 24/7 Bulk Inquiries'] },
                { icon: HiOutlineMail, title: 'Email Us', lines: ['wisdompharma866@gmail.com'] },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="flex gap-4 p-5 rounded-2xl border border-slate-200 hover:border-primary-200 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">{item.title}</h3>
                    {item.lines.map((line, j) => <p key={j} className="text-sm text-slate-500">{line}</p>)}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="lg:col-span-2 bg-slate-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                    <input {...register('name', { required: 'Name is required' })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400" placeholder="Your name" />
                    {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                    <input {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400" placeholder="your@email.com" />
                    {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
                  <input {...register('subject', { required: 'Subject is required' })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400" placeholder="How can we help?" />
                  {errors.subject && <p className="text-xs text-rose-500 mt-1">{errors.subject.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                  <textarea {...register('message', { required: 'Message is required' })} rows={5} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 resize-none" placeholder="Write your message..." />
                  {errors.message && <p className="text-xs text-rose-500 mt-1">{errors.message.message}</p>}
                </div>
                <button type="submit" disabled={isSubmitting}
                  className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60 shadow-sm">
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
