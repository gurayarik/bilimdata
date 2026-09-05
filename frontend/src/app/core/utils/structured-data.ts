import { environment } from '../../../environments/environment';
import { BlogPost } from '../models/blog.model';
import { Course } from '../models/course.model';

export function buildCourseJsonLd(course: Course): object {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.short_description ?? course.description ?? '',
    provider: {
      '@type': 'Organization',
      name: 'BilimData',
      sameAs: environment.siteBaseUrl,
    },
  };
  if (course.cover_image_url) {
    jsonLd['image'] = course.cover_image_url;
  }
  if (course.price != null) {
    jsonLd['offers'] = {
      '@type': 'Offer',
      price: course.discount_price ?? course.price,
      priceCurrency: 'TRY',
      url: `${environment.siteBaseUrl}/courses/${course.slug}`,
    };
  }
  return jsonLd;
}

export function buildBlogPostingJsonLd(post: BlogPost): object {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt ?? post.ai_summary ?? '',
    datePublished: post.published_at ?? post.created_at,
    author: {
      '@type': 'Organization',
      name: 'BilimData',
    },
  };
  if (post.cover_image_url) {
    jsonLd['image'] = post.cover_image_url;
  }
  return jsonLd;
}

export function buildOrganizationJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BilimData',
    url: environment.siteBaseUrl,
    logo: `${environment.siteBaseUrl}/favicon.svg`,
  };
}
