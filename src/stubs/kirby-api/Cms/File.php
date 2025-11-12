<?php

/**
 * Kirby File Class Stub
 *
 * This is a stub file for IntelliSense support. It contains method signatures
 * and PHPDoc annotations but no actual implementation.
 *
 * @version Kirby 4.0
 * @link https://getkirby.com/docs/reference/objects/cms/file
 */

namespace Kirby\Cms;

/**
 * The File class represents a file in Kirby.
 *
 * @link https://getkirby.com/docs/reference/objects/cms/file
 */
class File
{
    /**
     * Returns the file's URL
     *
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/file/url
     */
    public function url(): string
    {
    }

    /**
     * Returns the filename
     *
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/file/filename
     */
    public function filename(): string
    {
    }

    /**
     * Returns the file extension
     *
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/file/extension
     */
    public function extension(): string
    {
    }

    /**
     * Returns the file type (image, document, video, audio, etc.)
     *
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/file/type
     */
    public function type(): string
    {
    }

    /**
     * Returns the MIME type
     *
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/file/mime
     */
    public function mime(): string
    {
    }

    /**
     * Returns the file size in bytes
     *
     * @return int
     * @link https://getkirby.com/docs/reference/objects/cms/file/size
     */
    public function size(): int
    {
    }

    /**
     * Returns the file size in a nice format
     *
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/file/nice-size
     */
    public function niceSize(): string
    {
    }

    /**
     * Returns the parent page
     *
     * @return \Kirby\Cms\Page
     * @link https://getkirby.com/docs/reference/objects/cms/file/parent
     */
    public function parent()
    {
    }

    /**
     * Returns a specific field value
     *
     * @param string $field
     * @param bool $fallback
     * @return \Kirby\Cms\Field
     * @link https://getkirby.com/docs/reference/objects/cms/file/__call
     */
    public function __call(string $field, $fallback = false)
    {
    }

    /**
     * Returns all content fields
     *
     * @return \Kirby\Cms\Content
     * @link https://getkirby.com/docs/reference/objects/cms/file/content
     */
    public function content()
    {
    }

    /**
     * Returns the file's blueprint
     *
     * @return \Kirby\Cms\FileBlueprint
     * @link https://getkirby.com/docs/reference/objects/cms/file/blueprint
     */
    public function blueprint()
    {
    }

    /**
     * Checks if the file is an image
     *
     * @return bool
     * @link https://getkirby.com/docs/reference/objects/cms/file/is-image
     */
    public function isImage(): bool
    {
    }

    /**
     * Returns the modified timestamp
     *
     * @param string|null $format
     * @param string|null $handler
     * @return int|string
     * @link https://getkirby.com/docs/reference/objects/cms/file/modified
     */
    public function modified(?string $format = null, ?string $handler = null)
    {
    }

    /**
     * Returns a resized version of the file (for images)
     *
     * @param int|null $width
     * @param int|null $height
     * @param int|null $quality
     * @return \Kirby\Cms\FileVersion|null
     * @link https://getkirby.com/docs/reference/objects/cms/file/resize
     */
    public function resize(?int $width = null, ?int $height = null, ?int $quality = null)
    {
    }

    /**
     * Returns a cropped version of the file (for images)
     *
     * @param int $width
     * @param int|null $height
     * @param int|null $quality
     * @return \Kirby\Cms\FileVersion|null
     * @link https://getkirby.com/docs/reference/objects/cms/file/crop
     */
    public function crop(int $width, ?int $height = null, ?int $quality = null)
    {
    }

    /**
     * Returns a thumbnail version of the file
     *
     * @param string|array $options
     * @return \Kirby\Cms\FileVersion|null
     * @link https://getkirby.com/docs/reference/objects/cms/file/thumb
     */
    public function thumb($options = null)
    {
    }

    /**
     * Returns the alt text for the file
     *
     * @return \Kirby\Cms\Field
     * @link https://getkirby.com/docs/reference/objects/cms/file/alt
     */
    public function alt()
    {
    }

    /**
     * Converts the file to an array
     *
     * @return array
     * @link https://getkirby.com/docs/reference/objects/cms/file/to-array
     */
    public function toArray(): array
    {
    }
}
