.PHONY: test-unit test-coverage pytest

test\:unit:
	cd frontend && npm run test:unit

test\:coverage:
	cd frontend && npm run test:coverage

pytest:
	cd backend && pytest
