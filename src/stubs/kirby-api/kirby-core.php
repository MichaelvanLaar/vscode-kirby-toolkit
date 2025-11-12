<?php

/**
 * Kirby Core Stub - Namespace and Autoloader Declarations
 *
 * This file provides namespace declarations and autoloader hints for IntelliSense.
 * It includes no actual implementation.
 *
 * @version Kirby 4.0
 * @link https://getkirby.com
 */

namespace Kirby\Cms {

    /**
     * Pages Collection
     * @link https://getkirby.com/docs/reference/objects/cms/pages
     */
    class Pages extends \Kirby\Toolkit\Collection
    {
        /**
         * Finds a page by ID
         * @param string $id
         * @return \Kirby\Cms\Page|null
         */
        public function find(string $id) {}

        /**
         * Returns the first page
         * @return \Kirby\Cms\Page|null
         */
        public function first() {}

        /**
         * Returns the last page
         * @return \Kirby\Cms\Page|null
         */
        public function last() {}

        /**
         * Filters listed pages
         * @return \Kirby\Cms\Pages
         */
        public function listed() {}

        /**
         * Filters unlisted pages
         * @return \Kirby\Cms\Pages
         */
        public function unlisted() {}

        /**
         * Filters draft pages
         * @return \Kirby\Cms\Pages
         */
        public function drafts() {}

        /**
         * Sorts pages by field
         * @param string $field
         * @param string $direction
         * @param int $flags
         * @return \Kirby\Cms\Pages
         */
        public function sortBy(string $field, string $direction = 'asc', int $flags = 0) {}

        /**
         * Returns a paginated collection
         * @param int $limit
         * @param array $options
         * @return \Kirby\Cms\Pages
         */
        public function paginate(int $limit, array $options = []) {}
    }

    /**
     * Files Collection
     * @link https://getkirby.com/docs/reference/objects/cms/files
     */
    class Files extends \Kirby\Toolkit\Collection
    {
        /**
         * Finds a file by filename
         * @param string $id
         * @return \Kirby\Cms\File|null
         */
        public function find(string $id) {}

        /**
         * Returns the first file
         * @return \Kirby\Cms\File|null
         */
        public function first() {}

        /**
         * Returns the last file
         * @return \Kirby\Cms\File|null
         */
        public function last() {}

        /**
         * Sorts files by field
         * @param string $field
         * @param string $direction
         * @param int $flags
         * @return \Kirby\Cms\Files
         */
        public function sortBy(string $field, string $direction = 'asc', int $flags = 0) {}
    }

    /**
     * Users Collection
     * @link https://getkirby.com/docs/reference/objects/cms/users
     */
    class Users extends \Kirby\Toolkit\Collection
    {
        /**
         * Finds a user by ID or email
         * @param string $id
         * @return \Kirby\Cms\User|null
         */
        public function find(string $id) {}

        /**
         * Returns the first user
         * @return \Kirby\Cms\User|null
         */
        public function first() {}

        /**
         * Returns the last user
         * @return \Kirby\Cms\User|null
         */
        public function last() {}

        /**
         * Filters users by role
         * @param string $role
         * @return \Kirby\Cms\Users
         */
        public function filterBy(string $role) {}
    }

    /**
     * Content class
     * @link https://getkirby.com/docs/reference/objects/cms/content
     */
    class Content
    {
        /**
         * Gets a field value
         * @param string $key
         * @param mixed $fallback
         * @return \Kirby\Cms\Field
         */
        public function get(string $key, $fallback = null) {}

        /**
         * Magic getter for fields
         * @param string $key
         * @return \Kirby\Cms\Field
         */
        public function __call(string $key, array $args = []) {}
    }

    /**
     * File Version class (resized/cropped images)
     */
    class FileVersion extends File {}

    /**
     * Blueprint classes
     */
    class PageBlueprint {}
    class SiteBlueprint {}
    class FileBlueprint {}
    class UserBlueprint {}

    /**
     * Template class
     */
    class Template {}

    /**
     * Role class
     */
    class Role {
        public function name(): string {}
        public function title(): string {}
    }

    /**
     * Language class
     */
    class Language {
        public function code(): string {}
        public function name(): string {}
    }

    /**
     * Languages collection
     */
    class Languages extends \Kirby\Toolkit\Collection {}

    /**
     * Roles collection
     */
    class Roles extends \Kirby\Toolkit\Collection {}
}

namespace Kirby\Toolkit {
    /**
     * Base Collection class
     */
    class Collection implements \Iterator, \Countable
    {
        /**
         * Returns the count of items
         * @return int
         */
        public function count(): int {}

        /**
         * Filters the collection
         * @param callable $callback
         * @return static
         */
        public function filter(callable $callback) {}

        /**
         * Maps the collection
         * @param callable $callback
         * @return static
         */
        public function map(callable $callback) {}

        /**
         * Returns an array representation
         * @return array
         */
        public function toArray(): array {}
    }
}

namespace Kirby\Http {
    /**
     * Request class
     */
    class Request {
        public function method(): string {}
        public function url(): string {}
        public function query(): array {}
    }
}

namespace Kirby\Session {
    /**
     * Session class
     */
    class Session {
        public function get(string $key, $default = null) {}
        public function set(string $key, $value): void {}
        public function destroy(): void {}
    }
}
