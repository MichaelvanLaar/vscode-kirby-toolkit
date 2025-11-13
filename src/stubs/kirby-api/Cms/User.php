<?php

/**
 * Kirby User Class Stub
 *
 * This is a stub file for IntelliSense support. It contains method signatures
 * and PHPDoc annotations but no actual implementation.
 *
 * @version Kirby 4.0
 * @link https://getkirby.com/docs/reference/objects/cms/user
 */

namespace Kirby\Cms;

/**
 * The User class represents a user in Kirby.
 *
 * @link https://getkirby.com/docs/reference/objects/cms/user
 */
class User
{
    /**
     * Returns the user's email address
     *
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/user/email
     */
    public function email(): string
    {
    }

    /**
     * Returns the user's name
     *
     * @return \Kirby\Cms\Field
     * @link https://getkirby.com/docs/reference/objects/cms/user/name
     */
    public function name()
    {
    }

    /**
     * Returns the user's role
     *
     * @return \Kirby\Cms\Role
     * @link https://getkirby.com/docs/reference/objects/cms/user/role
     */
    public function role()
    {
    }

    /**
     * Returns the user's ID
     *
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/user/id
     */
    public function id(): string
    {
    }

    /**
     * Checks if the user is the admin
     *
     * @return bool
     * @link https://getkirby.com/docs/reference/objects/cms/user/is-admin
     */
    public function isAdmin(): bool
    {
    }

    /**
     * Checks if the user is logged in
     *
     * @return bool
     * @link https://getkirby.com/docs/reference/objects/cms/user/is-logged-in
     */
    public function isLoggedIn(): bool
    {
    }

    /**
     * Returns the user's language code
     *
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/user/language
     */
    public function language(): string
    {
    }

    /**
     * Returns a collection of all files
     *
     * @return \Kirby\Cms\Files
     * @link https://getkirby.com/docs/reference/objects/cms/user/files
     */
    public function files()
    {
    }

    /**
     * Returns a specific file by filename
     *
     * @param string|null $filename
     * @return \Kirby\Cms\File|null
     * @link https://getkirby.com/docs/reference/objects/cms/user/file
     */
    public function file(?string $filename = null)
    {
    }

    /**
     * Returns the user's avatar file
     *
     * @return \Kirby\Cms\File|null
     * @link https://getkirby.com/docs/reference/objects/cms/user/avatar
     */
    public function avatar()
    {
    }

    /**
     * Returns a specific field value
     *
     * @param string $field
     * @param bool $fallback
     * @return \Kirby\Cms\Field
     * @link https://getkirby.com/docs/reference/objects/cms/user/__call
     */
    public function __call(string $field, $fallback = false)
    {
    }

    /**
     * Returns all content fields
     *
     * @return \Kirby\Cms\Content
     * @link https://getkirby.com/docs/reference/objects/cms/user/content
     */
    public function content()
    {
    }

    /**
     * Returns the user's blueprint
     *
     * @return \Kirby\Cms\UserBlueprint
     * @link https://getkirby.com/docs/reference/objects/cms/user/blueprint
     */
    public function blueprint()
    {
    }

    /**
     * Converts the user to an array
     *
     * @return array
     * @link https://getkirby.com/docs/reference/objects/cms/user/to-array
     */
    public function toArray(): array
    {
    }
}
