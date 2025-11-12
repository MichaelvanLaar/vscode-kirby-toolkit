<?php

/**
 * Kirby Field Class Stub
 *
 * This is a stub file for IntelliSense support. It contains method signatures
 * and PHPDoc annotations but no actual implementation.
 *
 * @version Kirby 4.0
 * @link https://getkirby.com/docs/reference/objects/cms/field
 */

namespace Kirby\Cms;

/**
 * The Field class represents a content field in Kirby.
 *
 * @link https://getkirby.com/docs/reference/objects/cms/field
 */
class Field
{
    /**
     * Returns the field value
     *
     * @return string|null
     * @link https://getkirby.com/docs/reference/objects/cms/field/value
     */
    public function value(): ?string
    {
    }

    /**
     * Checks if the field is empty
     *
     * @return bool
     * @link https://getkirby.com/docs/reference/objects/cms/field/is-empty
     */
    public function isEmpty(): bool
    {
    }

    /**
     * Checks if the field is not empty
     *
     * @return bool
     * @link https://getkirby.com/docs/reference/objects/cms/field/is-not-empty
     */
    public function isNotEmpty(): bool
    {
    }

    /**
     * Converts the field value to a different type or format
     *
     * @param string $method
     * @param array $args
     * @return mixed
     * @link https://getkirby.com/docs/reference/objects/cms/field
     */
    public function __call(string $method, array $args = [])
    {
    }

    /**
     * Returns the field as a string
     *
     * @return string
     */
    public function __toString(): string
    {
    }

    /**
     * Converts the field to HTML
     *
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/field/html
     */
    public function html(): string
    {
    }

    /**
     * Converts the field to an integer
     *
     * @return int
     * @link https://getkirby.com/docs/reference/objects/cms/field/to-int
     */
    public function toInt(): int
    {
    }

    /**
     * Converts the field to a float
     *
     * @return float
     * @link https://getkirby.com/docs/reference/objects/cms/field/to-float
     */
    public function toFloat(): float
    {
    }

    /**
     * Converts the field to a boolean
     *
     * @return bool
     * @link https://getkirby.com/docs/reference/objects/cms/field/to-bool
     */
    public function toBool(): bool
    {
    }

    /**
     * Escapes the field value for safe HTML output
     *
     * @param string $context
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/field/escape
     */
    public function escape(string $context = 'html'): string
    {
    }

    /**
     * Converts Markdown to HTML
     *
     * @param array $options
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/field/markdown
     */
    public function markdown(array $options = []): string
    {
    }

    /**
     * Converts KirbyText to HTML
     *
     * @param array $options
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/field/kirbytext
     */
    public function kirbytext(array $options = []): string
    {
    }

    /**
     * Converts the field value to a date
     *
     * @param string|null $format
     * @param string|null $handler
     * @return string|int
     * @link https://getkirby.com/docs/reference/objects/cms/field/to-date
     */
    public function toDate(?string $format = null, ?string $handler = null)
    {
    }

    /**
     * Splits the field value into an array
     *
     * @param string $separator
     * @return array
     * @link https://getkirby.com/docs/reference/objects/cms/field/split
     */
    public function split(string $separator = ','): array
    {
    }

    /**
     * Converts YAML to an array
     *
     * @return array
     * @link https://getkirby.com/docs/reference/objects/cms/field/yaml
     */
    public function yaml(): array
    {
    }

    /**
     * Converts the field to a Pages collection
     *
     * @return \Kirby\Cms\Pages
     * @link https://getkirby.com/docs/reference/objects/cms/field/to-pages
     */
    public function toPages()
    {
    }

    /**
     * Converts the field to a Files collection
     *
     * @return \Kirby\Cms\Files
     * @link https://getkirby.com/docs/reference/objects/cms/field/to-files
     */
    public function toFiles()
    {
    }

    /**
     * Converts the field to a Users collection
     *
     * @return \Kirby\Cms\Users
     * @link https://getkirby.com/docs/reference/objects/cms/field/to-users
     */
    public function toUsers()
    {
    }

    /**
     * Converts the field to a Page object
     *
     * @return \Kirby\Cms\Page|null
     * @link https://getkirby.com/docs/reference/objects/cms/field/to-page
     */
    public function toPage()
    {
    }

    /**
     * Converts the field to a File object
     *
     * @return \Kirby\Cms\File|null
     * @link https://getkirby.com/docs/reference/objects/cms/field/to-file
     */
    public function toFile()
    {
    }

    /**
     * Converts the field to a User object
     *
     * @return \Kirby\Cms\User|null
     * @link https://getkirby.com/docs/reference/objects/cms/field/to-user
     */
    public function toUser()
    {
    }

    /**
     * Excerpts the field value
     *
     * @param int $length
     * @param bool $strip
     * @param string $rep
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/field/excerpt
     */
    public function excerpt(int $length = 140, bool $strip = true, string $rep = '…'): string
    {
    }

    /**
     * Converts line breaks to <br> tags
     *
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/field/nl2br
     */
    public function nl2br(): string
    {
    }

    /**
     * Converts the field to lowercase
     *
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/field/lower
     */
    public function lower(): string
    {
    }

    /**
     * Converts the field to uppercase
     *
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/field/upper
     */
    public function upper(): string
    {
    }
}
