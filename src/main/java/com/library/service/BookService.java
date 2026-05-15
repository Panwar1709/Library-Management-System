package com.library.service;

import com.library.dto.BookDTO;
import com.library.entity.Author;
import com.library.entity.Book;
import com.library.entity.Category;
import com.library.entity.User;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.AuthorRepository;
import com.library.repository.BookRepository;
import com.library.repository.CategoryRepository;
import com.library.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookService {
    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public BookService(
            BookRepository bookRepository,
            AuthorRepository authorRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository) {
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Book addBook(BookDTO dto) {
        Author author =
                authorRepository
                        .findById(dto.getAuthorId())
                        .orElseThrow(() -> new ResourceNotFoundException("Author not found"));

        List<Category> categories = categoryRepository.findAllById(dto.getCategoryIds());
        if (categories.size() != dto.getCategoryIds().size()) {
            throw new ResourceNotFoundException("One or more categories not found");
        }

        Book book =
                Book.builder()
                        .title(dto.getTitle())
                        .isbn(dto.getIsbn())
                        .author(author)
                        .categories(categories)
                        .available(true)
                        .build();
        return bookRepository.save(book);
    }

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Book getBookById(Long id) {
        return bookRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
    }

    @Transactional
    public Book borrowBook(Long bookId, Long userId) {
        Book book = getBookById(bookId);
        if (!book.isAvailable()) {
            throw new IllegalStateException("Book is already borrowed");
        }
        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        book.setBorrowedBy(user);
        book.setAvailable(false);
        return bookRepository.save(book);
    }

    @Transactional
    public Book returnBook(Long bookId) {
        Book book = getBookById(bookId);
        if (book.isAvailable()) {
            throw new IllegalStateException("Book is not currently borrowed");
        }
        book.setBorrowedBy(null);
        book.setAvailable(true);
        return bookRepository.save(book);
    }
}

