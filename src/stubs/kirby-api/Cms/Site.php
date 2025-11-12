<?php

/**
 * Kirby Site Class Stub
 *
 * This is a stub file for IntelliSense support. It contains method signatures
 * and PHPDoc annotations but no actual implementation.
 *
 * @version Kirby 4.0
 * @link https://getkirby.com/docs/reference/objects/cms/site
 */

namespace Kirby\Cms;

/**
 * The Site class represents the top-level site object in Kirby.
 *
 * @link https://getkirby.com/docs/reference/objects/cms/site
 */
class Site
{
    /**
     * Returns the site's title
     *
     * @return \Kirby\Cms\Field
     * @link https://getkirby.com/docs/reference/objects/cms/site/title
     */
    public function title()
    {
    }

    /**
     * Returns the site's URL
     *
     * @param string|null $language
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/site/url
     */
    public function url(?string $language = null): string
    {
    }

    /**
     * Returns a collection of all pages
     *
     * @return \Kirby\Cms\Pages
     * @link https://getkirby.com/docs/reference/objects/cms/site/pages
     */
    public function pages()
    {
    }

    /**
     * Returns a collection of child pages
     *
     * @return \Kirby\Cms\Pages
     * @link https://getkirby.com/docs/reference/objects/cms/site/children
     */
    public function children()
    {
    }

    /**
     * Finds a page by URI
     *
     * @param string $path
     * @return \Kirby\Cms\Page|null
     * @link https://getkirby.com/docs/reference/objects/cms/site/find
     */
    public function find(string $path)
    {
    }

    /**
     * Returns a collection of all pages and subpages
     *
     * @param bool $drafts
     * @return \Kirby\Cms\Pages
     * @link https://getkirby.com/docs/reference/objects/cms/site/index
     */
    public function index(bool $drafts = false)
    {
    }

    /**
     * Returns a collection of all files
     *
     * @return \Kirby\Cms\Files
     * @link https://getkirby.com/docs/reference/objects/cms/site/files
     */
    public function files()
    {
    }

    /**
     * Returns a collection of images
     *
     * @return \Kirby\Cms\Files
     * @link https://getkirby.com/docs/reference/objects/cms/site/images
     */
    public function images()
    {
    }

    /**
     * Returns a collection of document files
     *
     * @return \Kirby\Cms\Files
     * @link https://getkirby.com/docs/reference/objects/cms/site/documents
     */
    public function documents()
    {
    }

    /**
     * Returns a collection of video files
     *
     * @return \Kirby\Cms\Files
     * @link https://getkirby.com/docs/reference/objects/cms/site/videos
     */
    public function videos()
    {
    }

    /**
     * Returns a collection of audio files
     *
     * @return \Kirby\Cms\Files
     * @link https://getkirby.com/docs/reference/objects/cms/site/audio
     */
    public function audio()
    {
    }

    /**
     * Returns a specific file by filename
     *
     * @param string|null $filename
     * @return \Kirby\Cms\File|null
     * @link https://getkirby.com/docs/reference/objects/cms/site/file
     */
    public function file(?string $filename = null)
    {
    }

    /**
     * Returns a specific image by filename
     *
     * @param string|null $filename
     * @return \Kirby\Cms\File|null
     * @link https://getkirby.com/docs/reference/objects/cms/site/image
     */
    public function image(?string $filename = null)
    {
    }

    /**
     * Returns the home page
     *
     * @return \Kirby\Cms\Page|null
     * @link https://getkirby.com/docs/reference/objects/cms/site/home-page
     */
    public function homePage()
    {
    }

    /**
     * Returns the error page
     *
     * @return \Kirby\Cms\Page|null
     * @link https://getkirby.com/docs/reference/objects/cms/site/error-page
     */
    public function errorPage()
    {
    }

    /**
     * Returns a specific field value
     *
     * @param string $field
     * @param bool $fallback
     * @return \Kirby\Cms\Field
     * @link https://getkirby.com/docs/reference/objects/cms/site/__call
     */
    public function __call(string $field, $fallback = false)
    {
    }

    /**
     * Returns all content fields
     *
     * @param string|null $languageCode
     * @return \Kirby\Cms\Content
     * @link https://getkirby.com/docs/reference/objects/cms/site/content
     */
    public function content(?string $languageCode = null)
    {
    }

    /**
     * Returns the site's blueprint
     *
     * @return \Kirby\Cms\SiteBlueprint
     * @link https://getkirby.com/docs/reference/objects/cms/site/blueprint
     */
    public function blueprint()
    {
    }

    /**
     * Returns all users
     *
     * @return \Kirby\Cms\Users
     * @link https://getkirby.com/docs/reference/objects/cms/site/users
     */
    public function users()
    {
    }

    /**
     * Returns the modified timestamp
     *
     * @param string|null $format
     * @param string|null $handler
     * @return int|string
     * @link https://getkirby.com/docs/reference/objects/cms/site/modified
     */
    public function modified(?string $format = null, ?string $handler = null)
    {
    }

    /**
     * Converts the site to an array
     *
     * @return array
     * @link https://getkirby.com/docs/reference/objects/cms/site/to-array
     */
    public function toArray(): array
    {
    }

    /**
     * Returns the Kirby instance
     *
     * @return \Kirby\Cms\App
     * @link https://getkirby.com/docs/reference/objects/cms/site/kirby
     */
    public function kirby()
    {
    }
}
