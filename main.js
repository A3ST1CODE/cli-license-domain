const { program } = require('commander');
const crypto = require('crypto');
const { machineIdSync } = require('node-machine-id');

/**
 * @file License Key Manager CLI
 * @version 1.0.0
 * @author A3ST1CODE
 * @copyright 2025
 */

/**
 * Initialize CLI program
 */
program
	.version('1.0.0')
	.description('License Key Manager CLI');

/**
 * Command to generate a new license key
 * @param {Object} options - Command options
 * @param {string} options.domain - Domain name
 * @param {string} options.expire - Expiration date (YYYY-MM-DD)
 */
program
	.command('generate')
	.description('Generate a new license key')
	.requiredOption('-d, --domain <domain>', 'Domain name')
	.requiredOption('-e, --expire <expire>', 'Expire date (YYYY-MM-DD)')
	.action((options) => {
		const { domain, expire } = options;

		try {
			if (!isValidDomain(domain)) {
				throw new Error('Invalid domain format');
			}

			if (!isValidExpirationDate(expire)) {
				throw new Error('Invalid expiration date. Use format YYYY-MM-DD and date must be in the future');
			}

			const hardwareId = machineIdSync();
			const licenseKey = generateLicenseKey(domain, expire, hardwareId);
			const finalLicenseKey = addChecksum(licenseKey);

			console.log('Generated License Key:', finalLicenseKey);
		} catch (err) {
			console.error('Error:', err.message);
			process.exit(1);
		}
	});

/**
 * Command to verify a license key
 * @param {Object} options - Command options
 * @param {string} options.key - License key to verify
 */
program
	.command('verify')
	.description('Verify a license key')
	.requiredOption('-k, --key <license_key>', 'License key to verify')
	.action((options) => {
		try {
			const { key } = options;
			const parts = key.split('.');

			if (parts.length !== 3) {
				throw new Error('Invalid license key format');
			}

			const [salt, hash, checksum] = parts;
			const expectedChecksum = calculateChecksum(`${salt}.${hash}`);

			if (checksum !== expectedChecksum) {
				throw new Error('Invalid license key: checksum mismatch');
			}

			console.log('License key is valid');
			console.log('Salt:', salt);
			console.log('Hash:', hash);
			console.log('Checksum:', checksum);
		} catch (err) {
			console.error('Error:', err.message);
			process.exit(1);
		}
	});

program.parse(process.argv);

/**
 * Generates a license key from domain, expiration date and hardware ID
 * @param {string} domain - Domain name
 * @param {string} expire - Expiration date
 * @param {string} hardwareId - Unique hardware identifier
 * @returns {string} License key in format "salt.hash"
 * @throws {Error} If generation fails
 */
function generateLicenseKey(domain, expire, hardwareId) {
	try {
		const hash = crypto.createHash('sha256');
		const salt = crypto.randomBytes(16).toString('hex');
		hash.update(`${salt}-${domain}-${expire}-${hardwareId}`);
		return `${salt}.${hash.digest('hex')}`;
	} catch (error) {
		throw new Error('Failed to generate license key');
	}
}

/**
 * Validates domain name format
 * @param {string} domain - Domain name to validate
 * @returns {boolean} True if domain is valid
 */
function isValidDomain(domain) {
	const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
	return domainRegex.test(domain);
}

/**
 * Validates expiration date format and ensures it's in the future
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {boolean} True if date is valid and in the future
 */
function isValidExpirationDate(dateString) {
	const date = new Date(dateString);
	const today = new Date();

	return (
		!isNaN(date.getTime()) &&
		date > today &&
		/^\d{4}-\d{2}-\d{2}$/.test(dateString)
	);
}

/**
 * Calculates MD5 checksum for a string
 * @param {string} data - Input string
 * @returns {string} 8-character checksum
 */
function calculateChecksum(data) {
	return crypto
		.createHash('md5')
		.update(data)
		.digest('hex')
		.substring(0, 8);
}

/**
 * Adds checksum to a license key
 * @param {string} licenseKey - License key without checksum
 * @returns {string} License key with checksum appended
 */
function addChecksum(licenseKey) {
	const checksum = calculateChecksum(licenseKey);
	return `${licenseKey}.${checksum}`;
}