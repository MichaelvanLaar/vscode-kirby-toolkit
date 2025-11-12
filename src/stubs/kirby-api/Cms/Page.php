<?php

/**
 * Kirby Page Class Stub
 *
 * This is a stub file for IntelliSense support. It contains method signatures
 * and PHPDoc annotations but no actual implementation.
 *
 * @version Kirby 4.0
 * @link https://getkirby.com/docs/reference/objects/cms/page
 */

namespace Kirby\Cms;

use Kirby\Toolkit\Collection;

/**
 * The Page class represents a single page in the Kirby content tree.
 *
 * @link https://getkirby.com/docs/reference/objects/cms/page
 */
class Page
{
    /**
     * Returns the page's title
     *
     * @return \Kirby\Cms\Field
     * @link https://getkirby.com/docs/reference/objects/cms/page/title
     */
    public function title()
    {
    }

    /**
     * Returns the page's URL
     *
     * @param array|string|null $options
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/page/url
     */
    public function url($options = null): string
    {
    }

    /**
     * Returns the page's unique ID
     *
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/page/id
     */
    public function id(): string
    {
    }

    /**
     * Returns the page's UID (slug)
     *
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/page/uid
     */
    public function uid(): string
    {
    }

    /**
     * Returns a collection of child pages
     *
     * @return \Kirby\Cms\Pages
     * @link https://getkirby.com/docs/reference/objects/cms/page/children
     */
    public function children()
    {
    }

    /**
     * Returns the parent page
     *
     * @return \Kirby\Cms\Page|null
     * @link https://getkirby.com/docs/reference/objects/cms/page/parent
     */
    public function parent()
    {
    }

    /**
     * Returns all parent pages in a collection
     *
     * @return \Kirby\Cms\Pages
     * @link https://getkirby.com/docs/reference/objects/cms/page/parents
     */
    public function parents()
    {
    }

    /**
     * Returns a collection of all files
     *
     * @return \Kirby\Cms\Files
     * @link https://getkirby.com/docs/reference/objects/cms/page/files
     */
    public function files()
    {
    }

    /**
     * Returns a collection of images
     *
     * @return \Kirby\Cms\Files
     * @link https://getkirby.com/docs/reference/objects/cms/page/images
     */
    public function images()
    {
    }

    /**
     * Returns a collection of document files
     *
     * @return \Kirby\Cms\Files
     * @link https://getkirby.com/docs/reference/objects/cms/page/documents
     */
    public function documents()
    {
    }

    /**
     * Returns a collection of video files
     *
     * @return \Kirby\Cms\Files
     * @link https://getkirby.com/docs/reference/objects/cms/page/videos
     */
    public function videos()
    {
    }

    /**
     * Returns a collection of audio files
     *
     * @return \Kirby\Cms\Files
     * @link https://getkirby.com/docs/reference/objects/cms/page/audio
     */
    public function audio()
    {
    }

    /**
     * Returns a specific file by filename
     *
     * @param string|null $filename
     * @return \Kirby\Cms\File|null
     * @link https://getkirby.com/docs/reference/objects/cms/page/file
     */
    public function file(?string $filename = null)
    {
    }

    /**
     * Returns a specific image by filename
     *
     * @param string|null $filename
     * @return \Kirby\Cms\File|null
     * @link https://getkirby.com/docs/reference/objects/cms/page/image
     */
    public function image(?string $filename = null)
    {
    }

    /**
     * Returns a specific field value
     *
     * @param string $field
     * @param bool $fallback
     * @return \Kirby\Cms\Field
     * @link https://getkirby.com/docs/reference/objects/cms/page/__call
     */
    public function __call(string $field, $fallback = false)
    {
    }

    /**
     * Returns all content fields
     *
     * @return \Kirby\Cms\Content
     * @link https://getkirby.com/docs/reference/objects/cms/page/content
     */
    public function content()
    {
    }

    /**
     * Returns the page's blueprint
     *
     * @return \Kirby\Cms\PageBlueprint
     * @link https://getkirby.com/docs/reference/objects/cms/page/blueprint
     */
    public function blueprint()
    {
    }

    /**
     * Returns the page's intended template
     *
     * @return \Kirby\Cms\Template|null
     * @link https://getkirby.com/docs/reference/objects/cms/page/intendedTemplate
     */
    public function intendedTemplate()
    {
    }

    /**
     * Returns the page's template
     *
     * @return \Kirby\Cms\Template|null
     * @link https://getkirby.com/docs/reference/objects/cms/page/template
     */
    public function template()
    {
    }

    /**
     * Checks if the page is the home page
     *
     * @return bool
     * @link https://getkirby.com/docs/reference/objects/cms/page/is-home-page
     */
    public function isHomePage(): bool
    {
    }

    /**
     * Checks if the page is an error page
     *
     * @return bool
     * @link https://getkirby.com/docs/reference/objects/cms/page/is-error-page
     */
    public function isErrorPage(): bool
    {
    }

    /**
     * Checks if the page is listed
     *
     * @return bool
     * @link https://getkirby.com/docs/reference/objects/cms/page/is-listed
     */
    public function isListed(): bool
    {
    }

    /**
     * Checks if the page is unlisted
     *
     * @return bool
     * @link https://getkirby.com/docs/reference/objects/cms/page/is-unlisted
     */
    public function isUnlisted(): bool
    {
    }

    /**
     * Checks if the page is a draft
     *
     * @return bool
     * @link https://getkirby.com/docs/reference/objects/cms/page/is-draft
     */
    public function isDraft(): bool
    {
    }

    /**
     * Checks if the page is visible (listed)
     *
     * @return bool
     * @link https://getkirby.com/docs/reference/objects/cms/page/is-visible
     */
    public function isVisible(): bool
    {
    }

    /**
     * Checks if the page is invisible (unlisted)
     *
     * @return bool
     * @link https://getkirby.com/docs/reference/objects/cms/page/is-invisible
     */
    public function isInvisible(): bool
    {
    }

    /**
     * Finds a child page by URI
     *
     * @param string $path
     * @return \Kirby\Cms\Page|null
     * @link https://getkirby.com/docs/reference/objects/cms/page/find
     */
    public function find(string $path)
    {
    }

    /**
     * Returns a collection of children, grandchildren, etc.
     *
     * @param bool $andSelf
     * @return \Kirby\Cms\Pages
     * @link https://getkirby.com/docs/reference/objects/cms/page/index
     */
    public function index(bool $andSelf = false)
    {
    }

    /**
     * Returns siblings
     *
     * @param bool $self
     * @return \Kirby\Cms\Pages
     * @link https://getkirby.com/docs/reference/objects/cms/page/siblings
     */
    public function siblings(bool $self = true)
    {
    }

    /**
     * Returns the next sibling
     *
     * @return \Kirby\Cms\Page|null
     * @link https://getkirby.com/docs/reference/objects/cms/page/next
     */
    public function next()
    {
    }

    /**
     * Returns the previous sibling
     *
     * @return \Kirby\Cms\Page|null
     * @link https://getkirby.com/docs/reference/objects/cms/page/prev
     */
    public function prev()
    {
    }

    /**
     * Returns the next listed sibling
     *
     * @return \Kirby\Cms\Page|null
     * @link https://getkirby.com/docs/reference/objects/cms/page/next-listed
     */
    public function nextListed()
    {
    }

    /**
     * Returns the previous listed sibling
     *
     * @return \Kirby\Cms\Page|null
     * @link https://getkirby.com/docs/reference/objects/cms/page/prev-listed
     */
    public function prevListed()
    {
    }

    /**
     * Checks if the page has children
     *
     * @return bool
     * @link https://getkirby.com/docs/reference/objects/cms/page/has-children
     */
    public function hasChildren(): bool
    {
    }

    /**
     * Checks if the page has listed children
     *
     * @return bool
     * @link https://getkirby.com/docs/reference/objects/cms/page/has-listed-children
     */
    public function hasListedChildren(): bool
    {
    }

    /**
     * Checks if the page has unlisted children
     *
     * @return bool
     * @link https://getkirby.com/docs/reference/objects/cms/page/has-unlisted-children
     */
    public function hasUnlistedChildren(): bool
    {
    }

    /**
     * Checks if the page has draft children
     *
     * @return bool
     * @link https://getkirby.com/docs/reference/objects/cms/page/has-drafts
     */
    public function hasDrafts(): bool
    {
    }

    /**
     * Returns the page depth
     *
     * @return int
     * @link https://getkirby.com/docs/reference/objects/cms/page/depth
     */
    public function depth(): int
    {
    }

    /**
     * Returns the page number
     *
     * @return int|null
     * @link https://getkirby.com/docs/reference/objects/cms/page/num
     */
    public function num(): ?int
    {
    }

    /**
     * Returns the page status (draft, listed, unlisted)
     *
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/page/status
     */
    public function status(): string
    {
    }

    /**
     * Renders the page with its template
     *
     * @param array $data
     * @param string $contentType
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/page/render
     */
    public function render(array $data = [], string $contentType = 'html'): string
    {
    }

    /**
     * Returns the modified timestamp
     *
     * @param string|null $format
     * @param string|null $handler
     * @return int|string
     * @link https://getkirby.com/docs/reference/objects/cms/page/modified
     */
    public function modified(?string $format = null, ?string $handler = null)
    {
    }

    /**
     * Converts the page to an array
     *
     * @return array
     * @link https://getkirby.com/docs/reference/objects/cms/page/to-array
     */
    public function toArray(): array
    {
    }
}
